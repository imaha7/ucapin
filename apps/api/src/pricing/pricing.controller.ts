import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { QuoteDto, UpdatePricingRuleDto, UpdateTemplatePriceDto } from "./pricing.dto";
import { PricingService } from "./pricing.service";

@Controller("pricing")
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Post("quote")
  quote(@Body() body: QuoteDto) {
    return this.pricing.quote(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("rule")
  getRule() {
    return this.pricing.getRule();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch("rule")
  updateRule(@Body() body: UpdatePricingRuleDto) {
    return this.pricing.updateRule(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch("templates/:id")
  updateTemplatePrice(@Param("id") id: string, @Body() body: UpdateTemplatePriceDto) {
    return this.pricing.updateTemplatePrice(id, body);
  }
}
