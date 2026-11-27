import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AttendanceStatus, InvitationStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvitationDto, CreateRsvpDto, UpdateInvitationDto } from "./invitation.dto";

@Injectable()
export class InvitationsService {
  private readonly reservedSlugs = new Set([
    "admin", "api", "dashboard", "editor", "login", "preview", "pricing", "templates",
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async checkSlug(slug: string) {
    const normalized = slug.toLowerCase();
    if (this.reservedSlugs.has(normalized)) return { slug: normalized, available: false };
    const reserved = await this.prisma.invitation.findUnique({ where: { slug: normalized }, select: { id: true } });
    return { slug: normalized, available: !reserved };
  }

  async create(ownerId: string, input: CreateInvitationDto) {
    const slug = input.slug.toLowerCase();
    if (this.reservedSlugs.has(slug)) throw new ConflictException("This invitation URL is reserved.");
    const template = input.templateId
      ? await this.prisma.template.findFirst({ where: { id: input.templateId, isActive: true } })
      : input.templateSlug
        ? await this.prisma.template.findFirst({ where: { slug: input.templateSlug, isActive: true } })
        : null;
    if ((input.templateId || input.templateSlug) && !template) {
      throw new NotFoundException("Selected template was not found.");
    }
    try {
      return await this.prisma.invitation.create({
        data: {
          ownerId,
          slug,
          title: input.title.trim(),
          content: input.content as Prisma.InputJsonValue,
          calculatedPrice: template?.basePrice ?? 0,
          ...(template ? { templateId: template.id } : {}),
        },
        select: { id: true, slug: true, title: true, status: true, calculatedPrice: true, createdAt: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("This invitation URL is already reserved.");
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new NotFoundException("Selected template was not found.");
      }
      throw error;
    }
  }

  listMine(ownerId: string) {
    return this.prisma.invitation.findMany({
      where: { ownerId, status: { not: InvitationStatus.ARCHIVED } },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        calculatedPrice: true,
        publishedAt: true,
        updatedAt: true,
        template: { select: { slug: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getMine(ownerId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, ownerId, status: { not: InvitationStatus.ARCHIVED } },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        status: true,
        template: { select: { slug: true } },
      },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    return invitation;
  }

  async update(ownerId: string, id: string, input: UpdateInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      select: { ownerId: true, status: true },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (invitation.ownerId !== ownerId) throw new ForbiddenException("You do not own this invitation.");
    if (invitation.status === InvitationStatus.ARCHIVED) throw new NotFoundException("Invitation not found.");
    return this.prisma.invitation.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.content !== undefined ? { content: input.content as Prisma.InputJsonValue } : {}),
      },
      select: { id: true, slug: true, title: true, status: true, updatedAt: true },
    });
  }

  async remove(ownerId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, ownerId, status: { not: InvitationStatus.ARCHIVED } },
      select: {
        id: true,
        transaction: { select: { status: true, expiresAt: true } },
      },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (
      invitation.transaction?.status === "PENDING" &&
      invitation.transaction.expiresAt > new Date()
    ) {
      throw new ConflictException("This invitation has an active payment. Wait for it to finish or expire before deleting.");
    }

    await this.prisma.$transaction([
      this.prisma.rsvp.deleteMany({ where: { invitationId: id } }),
      this.prisma.guestWish.deleteMany({ where: { invitationId: id } }),
      this.prisma.invitation.update({
        where: { id },
        data: {
          slug: `deleted-${id}`,
          title: "Undangan dihapus",
          content: {},
          templateId: null,
          status: InvitationStatus.ARCHIVED,
          publishedAt: null,
          expiresAt: null,
        },
      }),
    ]);

    return { id, status: InvitationStatus.ARCHIVED };
  }

  async publish(ownerId: string, id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: { transaction: { select: { status: true } } },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (invitation.ownerId !== ownerId) throw new ForbiddenException("You do not own this invitation.");
    if (invitation.status === InvitationStatus.ARCHIVED) throw new NotFoundException("Invitation not found.");
    if (Number(invitation.calculatedPrice) > 0 && invitation.transaction?.status !== "PAID") {
      throw new ConflictException("Complete payment before publishing this invitation.");
    }
    return this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.PUBLISHED, publishedAt: invitation.publishedAt ?? new Date() },
      select: { id: true, slug: true, status: true, publishedAt: true },
    });
  }

  async getPublished(slug: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { slug: slug.toLowerCase(), status: InvitationStatus.PUBLISHED },
      select: { slug: true, title: true, content: true, publishedAt: true, template: { select: { name: true, imageUrl: true } } },
    });
    if (!invitation) throw new NotFoundException("Published invitation not found.");
    return invitation;
  }

  async createRsvp(slug: string, input: CreateRsvpDto) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { slug: slug.toLowerCase(), status: InvitationStatus.PUBLISHED },
      select: { id: true },
    });
    if (!invitation) throw new NotFoundException("Published invitation not found.");
    return this.prisma.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: input.guestName.trim(),
        attendance: input.attendance as AttendanceStatus,
        guestCount: input.guestCount ?? 1,
        ...(input.message ? { message: input.message.trim() } : {}),
      },
      select: { id: true, guestName: true, attendance: true, guestCount: true, createdAt: true },
    });
  }
}
