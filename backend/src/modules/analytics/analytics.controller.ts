import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('platform-overview')
    getPlatformOverview() { return this.analyticsService.getPlatformOverview(); }

    @Get('signups')
    getSignups(@Query('days') days?: number) { return this.analyticsService.getSignupsByDay(days); }

    @Get('bookings-by-day')
    getBookingsByDay(@Query('days') days?: number) { return this.analyticsService.getBookingsByDay(days); }

    @Get('cuisine-distribution')
    getCuisineDistribution() { return this.analyticsService.getCuisineDistribution(); }

    @Get('restaurant/:restaurantId/dashboard')
    getRestaurantDashboard(@Param('restaurantId') restaurantId: string) {
        return this.analyticsService.getRestaurantDashboard(restaurantId);
    }

    @Get('restaurant/:restaurantId/heatmap')
    getHeatmap(@Param('restaurantId') restaurantId: string) {
        return this.analyticsService.getReservationsHeatmap(restaurantId);
    }
}