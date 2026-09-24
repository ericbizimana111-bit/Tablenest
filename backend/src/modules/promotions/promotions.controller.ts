import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { PromotionsService } from './promotions.service';

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
  @Roles(UserRole.OWNER)
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.promotionsService.findByRestaurant(req.user, restaurantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.promotionsService.create(req.user, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.promotionsService.update(req.user, id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id/toggle')
  toggle(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.promotionsService.toggle(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.promotionsService.delete(req.user, id);
  }
}
