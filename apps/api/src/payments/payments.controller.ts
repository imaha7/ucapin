import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthenticatedUser, CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateCheckoutDto, MidtransNotificationDto } from "./payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":invitationId/checkout")
  createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Param("invitationId") invitationId: string,
    @Body() body: CreateCheckoutDto,
  ) {
    return this.payments.createCheckout(user.id, invitationId, body.method);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":invitationId/status")
  getStatus(@CurrentUser() user: AuthenticatedUser, @Param("invitationId") invitationId: string) {
    return this.payments.getStatus(user.id, invitationId);
  }

  @Post("webhook")
  async webhook(@Body() body: MidtransNotificationDto) {
    await this.payments.processNotification(body);
    return { received: true };
  }
}
