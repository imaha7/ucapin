import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";
import { InvitationsModule } from "./invitations/invitations.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PricingModule } from "./pricing/pricing.module";
import { PaymentsModule } from "./payments/payments.module";
import { TemplatesModule } from "./templates/templates.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 90 }]),
    PrismaModule,
    AuthModule,
    TemplatesModule,
    PricingModule,
    PaymentsModule,
    InvitationsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
