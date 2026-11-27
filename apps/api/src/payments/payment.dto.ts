import { IsEnum, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreateCheckoutDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}

export class MidtransNotificationDto {
  @IsString()
  @MaxLength(64)
  order_id!: string;

  @IsString()
  @Matches(/^\d{3}$/)
  status_code!: string;

  @IsString()
  @Matches(/^\d+(?:\.\d{1,2})?$/)
  gross_amount!: string;

  @IsString()
  @MaxLength(32)
  transaction_status!: string;

  @IsString()
  @MaxLength(256)
  signature_key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  fraud_status?: string;
}
