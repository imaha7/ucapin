import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthenticatedUser, CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateInvitationDto, CreateRsvpDto, UpdateInvitationDto } from "./invitation.dto";
import { InvitationsService } from "./invitations.service";

@Controller("invitations")
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get("slug/:slug/availability")
  checkSlug(@Param("slug") slug: string) {
    return this.invitations.checkSlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateInvitationDto) {
    return this.invitations.create(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("mine")
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.invitations.listMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getMine(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invitations.getMine(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() body: UpdateInvitationDto) {
    return this.invitations.update(user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invitations.remove(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/publish")
  publish(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invitations.publish(user.id, id);
  }

  @Get("public/:slug")
  getPublished(@Param("slug") slug: string) {
    return this.invitations.getPublished(slug);
  }

  @Post("public/:slug/rsvp")
  createRsvp(@Param("slug") slug: string, @Body() body: CreateRsvpDto) {
    return this.invitations.createRsvp(slug, body);
  }
}
