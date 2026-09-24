import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { AnalyticsService } from './analytics.service';
import { AccessControlService } from '../../common/services/access-control.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private accessControl: AccessControlService,
  ) {}

  @Get('restaurant/:restaurantId/dashboard')
  async getRestaurantDashboard(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    const restaurant = await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getRestaurantDashboard(restaurant);
  }

  @Get('restaurant/:restaurantId/overview')
  async getOverview(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query('days') days?: string) {
    const restaurant = await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getOverview(restaurant, Number(days) || 30);
  }

  @Get('restaurant/:restaurantId/heatmap')
  async getHeatmap(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    const restaurant = await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getReservationsHeatmap(restaurant);
  }
}
