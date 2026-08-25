import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { AnalyticsService } from './analytics.service';
import { AccessControlService } from '../../common/services/access-control.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private accessControl: AccessControlService,
  ) {}

  @Get('platform-overview')
  @Roles(UserRole.SUPER_ADMIN)
  getPlatformOverview() {
    return this.analyticsService.getPlatformOverview();
  }

  @Get('signups')
  @Roles(UserRole.SUPER_ADMIN)
  getSignups(@Query('days') days?: number) {
    return this.analyticsService.getSignupsByDay(days);
  }

  @Get('bookings-by-day')
  @Roles(UserRole.SUPER_ADMIN)
  getBookingsByDay(@Query('days') days?: number) {
    return this.analyticsService.getBookingsByDay(days);
  }

  @Get('cuisine-distribution')
  @Roles(UserRole.SUPER_ADMIN)
  getCuisineDistribution() {
    return this.analyticsService.getCuisineDistribution();
  }

  @Get('restaurant/:restaurantId/dashboard')
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  async getRestaurantDashboard(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getRestaurantDashboard(restaurantId);
  }

  @Get('restaurant/:restaurantId/heatmap')
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  async getHeatmap(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getReservationsHeatmap(restaurantId);
  }

  @Get('revenue-by-day')
  @Roles(UserRole.SUPER_ADMIN)
  getRevenueByDay(@Query('days') days?: number) {
    return this.analyticsService.getRevenueByDay(days);
  }

  @Get('orders-by-day')
  @Roles(UserRole.SUPER_ADMIN)
  getOrdersByDay(@Query('days') days?: number) {
    return this.analyticsService.getOrdersByDay(days);
  }
}
