import { IsInt, IsObject, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateInvitationDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "slug must contain lowercase letters, numbers, and single hyphens." })
  @MinLength(3)
  @MaxLength(60)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  templateSlug?: string;
}

export class UpdateInvitationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}

export class CreateRsvpDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  guestName!: string;

  @IsString()
  @Matches(/^(ATTENDING|NOT_ATTENDING|MAYBE)$/)
  attendance!: "ATTENDING" | "NOT_ATTENDING" | "MAYBE";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  guestCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
