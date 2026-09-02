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

  @Get('restaurant/:restaurantId/dashboard')
  @Roles(UserRole.OWNER)
  async getRestaurantDashboard(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getRestaurantDashboard(restaurantId);
  }

  @Get('restaurant/:restaurantId/heatmap')
  @Roles(UserRole.OWNER)
  async getHeatmap(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    await this.accessControl.assertRestaurantOwner(req.user, restaurantId);
    return this.analyticsService.getReservationsHeatmap(restaurantId);
  }
}
