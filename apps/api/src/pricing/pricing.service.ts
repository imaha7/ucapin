import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QuoteDto, UpdatePricingRuleDto, UpdateTemplatePriceDto } from "./pricing.dto";

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(input: QuoteDto) {
    const template = input.templateId
      ? await this.prisma.template.findFirst({ where: { id: input.templateId, isActive: true } })
      : null;
    if (input.templateId && !template) throw new NotFoundException("Selected template was not found.");

    if (template?.pricingMode === "MANUAL") {
      return { amount: Number(template.basePrice), currency: "IDR", mode: "MANUAL" };
    }

    const rule = await this.prisma.pricingRule.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
    if (!rule) throw new NotFoundException("No active pricing rule is configured.");
    const amount =
      Number(rule.baseCustomPrice) +
      input.sectionCount * Number(rule.pricePerSection) +
      (input.extraMediaCount ?? 0) * Number(rule.extraMediaPrice) +
      (input.customAudio ? Number(rule.customAudioPrice) : 0);
    return { amount, currency: "IDR", mode: "AUTOMATIC" };
  }

  getRule() {
    return this.prisma.pricingRule.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
  }

  async updateRule(input: UpdatePricingRuleDto) {
    const current = await this.getRule();
    if (current) {
      return this.prisma.pricingRule.update({ where: { id: current.id }, data: input });
    }
    return this.prisma.pricingRule.create({
      data: { name: input.name ?? "Harga custom default", ...input },
    });
  }

  async updateTemplatePrice(id: string, input: UpdateTemplatePriceDto) {
    const template = await this.prisma.template.findUnique({ where: { id }, select: { id: true } });
    if (!template) throw new NotFoundException("Template not found.");
    return this.prisma.template.update({
      where: { id },
      data: input,
      select: { id: true, slug: true, name: true, pricingMode: true, basePrice: true, tier: true },
    });
  }
}
