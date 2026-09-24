import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto } from './promotions.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  // ── Public ────────────────────────────────────────────────────────────────
  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.promotionsService.featured(Number(limit) || 6);
  }

  @Get('active/:restaurantId')
  active(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.promotionsService.findActiveForRestaurant(restaurantId);
  }

  // ── Owner ─────────────────────────────────────────────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.promotionsService.findByRestaurant(req.user, restaurantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  create(@Request() req, @Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(req.user, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(req.user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id/toggle')
  toggle(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.promotionsService.toggle(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.promotionsService.delete(req.user, id);
  }
}
