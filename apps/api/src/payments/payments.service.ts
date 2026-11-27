import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InvitationStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MidtransNotificationDto } from "./payment.dto";

type SnapResponse = { token?: string; redirect_url?: string };

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async createCheckout(ownerId: string, invitationId: string, method: PaymentMethod) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { owner: { select: { name: true, email: true } }, transaction: true },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (invitation.ownerId !== ownerId) throw new ForbiddenException("You do not own this invitation.");
    if (invitation.status === InvitationStatus.PUBLISHED || invitation.status === InvitationStatus.ARCHIVED) {
      throw new ConflictException("This invitation cannot be checked out.");
    }

    const amount = Number(invitation.calculatedPrice);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new ConflictException("This invitation does not require a paid checkout.");
    }

    const serverKey = this.config.get<string>("MIDTRANS_SERVER_KEY");
    if (!serverKey) throw new ServiceUnavailableException("Payment gateway is not configured.");

    const now = new Date();
    const currentTransaction = invitation.transaction;
    if (
      currentTransaction?.status === PaymentStatus.PENDING &&
      currentTransaction.expiresAt > now &&
      currentTransaction.checkoutUrl
    ) {
      return {
        orderId: currentTransaction.gatewayReference,
        redirectUrl: currentTransaction.checkoutUrl,
        status: currentTransaction.status,
        expiresAt: currentTransaction.expiresAt,
      };
    }
    if (currentTransaction?.status === PaymentStatus.PAID) {
      throw new ConflictException("Payment has already been completed.");
    }

    const orderId = `UC${Date.now()}${randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const transactionData = {
      amount: new Prisma.Decimal(amount),
      method,
      gatewayReference: orderId,
      status: PaymentStatus.PENDING,
      expiresAt,
      paidAt: null,
      snapToken: null,
      checkoutUrl: null,
    };

    if (currentTransaction) {
      await this.prisma.$transaction([
        this.prisma.paymentTransaction.update({
          where: { id: currentTransaction.id },
          data: transactionData,
        }),
        this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.UNPAID, expiresAt },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.paymentTransaction.create({
          data: { invitationId: invitation.id, ...transactionData },
        }),
        this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.UNPAID, expiresAt },
        }),
      ]);
    }

    const isProduction = this.config.get<string>("MIDTRANS_IS_PRODUCTION") === "true";
    const baseUrl = isProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
    const webOrigin = this.config.get<string>("WEB_ORIGIN", "http://localhost:3000").replace(/\/+$/, "");
    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      item_details: [{
        id: invitation.id,
        price: amount,
        quantity: 1,
        name: invitation.title.slice(0, 50),
      }],
      customer_details: {
        first_name: invitation.owner.name.slice(0, 50),
        email: invitation.owner.email,
      },
      enabled_payments: method === PaymentMethod.QRIS ? ["qris"] : ["bank_transfer"],
      expiry: { unit: "hours", duration: 24 },
      callbacks: {
        finish: `${webOrigin}/dashboard?payment=finish&invitation=${encodeURIComponent(invitation.id)}`,
      },
    };

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/snap/v1/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      await this.failPendingTransaction(orderId);
      throw new ServiceUnavailableException("Could not reach the payment gateway. Please try again.");
    }

    if (!response.ok) {
      await this.failPendingTransaction(orderId);
      throw new ServiceUnavailableException("Payment gateway rejected the checkout request.");
    }

    let snap: SnapResponse;
    try {
      snap = await response.json() as SnapResponse;
    } catch {
      await this.failPendingTransaction(orderId);
      throw new ServiceUnavailableException("Payment gateway returned an invalid checkout response.");
    }
    if (!snap.token || !snap.redirect_url) {
      await this.failPendingTransaction(orderId);
      throw new ServiceUnavailableException("Payment gateway did not return a checkout link.");
    }

    await this.prisma.paymentTransaction.update({
      where: { gatewayReference: orderId },
      data: { snapToken: snap.token, checkoutUrl: snap.redirect_url },
    });
    return { orderId, redirectUrl: snap.redirect_url, status: PaymentStatus.PENDING, expiresAt };
  }

  async getStatus(ownerId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        ownerId: true,
        slug: true,
        status: true,
        publishedAt: true,
        calculatedPrice: true,
        transaction: { select: { status: true, method: true, expiresAt: true, paidAt: true } },
      },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (invitation.ownerId !== ownerId) throw new ForbiddenException("You do not own this invitation.");
    if (invitation.status === InvitationStatus.ARCHIVED) throw new NotFoundException("Invitation not found.");
    return {
      slug: invitation.slug,
      invitationStatus: invitation.status,
      publishedAt: invitation.publishedAt,
      amount: Number(invitation.calculatedPrice),
      payment: invitation.transaction,
    };
  }

  async processNotification(notification: MidtransNotificationDto) {
    const serverKey = this.config.get<string>("MIDTRANS_SERVER_KEY");
    if (!serverKey) throw new ServiceUnavailableException("Payment gateway is not configured.");

    const expected = createHash("sha512")
      .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
      .digest();
    const supplied = Buffer.from(notification.signature_key, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      throw new UnauthorizedException("Invalid payment notification signature.");
    }

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { gatewayReference: notification.order_id },
      include: { invitation: { select: { id: true } } },
    });
    if (!transaction) throw new NotFoundException("Payment transaction not found.");

    const notifiedAmount = Number(notification.gross_amount);
    if (!Number.isFinite(notifiedAmount) || notifiedAmount !== Number(transaction.amount)) {
      throw new ConflictException("Payment notification amount does not match the transaction.");
    }

    const newStatus = this.mapStatus(notification.transaction_status, notification.fraud_status);
    if (!newStatus || transaction.status === PaymentStatus.PAID) return;

    await this.prisma.$transaction(async (db) => {
      const current = await db.paymentTransaction.findUnique({
        where: { id: transaction.id },
        select: { status: true },
      });
      if (!current || current.status === PaymentStatus.PAID) return;

      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          ...(newStatus === PaymentStatus.PAID ? { paidAt: new Date() } : {}),
        },
      });
      if (newStatus === PaymentStatus.PAID) {
        await db.invitation.updateMany({
          where: { id: transaction.invitation.id, status: { not: InvitationStatus.ARCHIVED } },
          data: { status: InvitationStatus.PUBLISHED, publishedAt: new Date(), expiresAt: null },
        });
      } else if (newStatus === PaymentStatus.EXPIRED || newStatus === PaymentStatus.FAILED) {
        await db.invitation.updateMany({
          where: { id: transaction.invitation.id, status: InvitationStatus.UNPAID },
          data: { status: InvitationStatus.DRAFT, expiresAt: null },
        });
      }
    });
  }

  private mapStatus(status: string, fraudStatus?: string): PaymentStatus | null {
    if (status === "settlement" || (status === "capture" && fraudStatus === "accept")) {
      return PaymentStatus.PAID;
    }
    if (status === "pending" || (status === "capture" && fraudStatus === "challenge")) {
      return PaymentStatus.PENDING;
    }
    if (status === "expire") return PaymentStatus.EXPIRED;
    if (status === "deny" || status === "cancel") return PaymentStatus.FAILED;
    return null;
  }

  private async failPendingTransaction(orderId: string) {
    await this.prisma.$transaction([
      this.prisma.paymentTransaction.updateMany({
        where: { gatewayReference: orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      }),
      this.prisma.invitation.updateMany({
        where: { transaction: { gatewayReference: orderId }, status: InvitationStatus.UNPAID },
        data: { status: InvitationStatus.DRAFT, expiresAt: null },
      }),
    ]);
  }
}
