import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { PricingMode, TemplateTier } from "@prisma/client";

export class QuoteDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  sectionCount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  extraMediaCount?: number;

  @IsOptional()
  @IsBoolean()
  customAudio?: boolean;
}

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseCustomPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerSection?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraMediaPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  customAudioPrice?: number;
}

export class UpdateTemplatePriceDto {
  @IsEnum(PricingMode)
  pricingMode!: PricingMode;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @IsEnum(TemplateTier)
  tier!: TemplateTier;
}
