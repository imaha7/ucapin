import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { TemplatesService } from "./templates.service";

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  list() {
    return this.templates.list();
  }

  @Get(":slug")
  async getBySlug(@Param("slug") slug: string) {
    const template = await this.templates.getBySlug(slug);
    if (!template) throw new NotFoundException("Template not found.");
    return template;
  }
}
