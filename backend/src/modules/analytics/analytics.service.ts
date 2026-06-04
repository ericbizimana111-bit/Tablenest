import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Reservation, ReservationDocument } from '../reservations/reservation.schema';
import { User, UserDocument } from '../users/user.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    ) { }

    async getPlatformOverview() {
        const [restaurants, users, bookings, orders, revenue] = await Promise.all([
            this.restaurantModel.countDocuments(),
            this.userModel.countDocuments(),
            this.reservationModel.countDocuments(),
            this.orderModel.countDocuments(),
            this.orderModel.aggregate([
                { $match: { status: OrderStatus.DELIVERED } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);
        const pending = await this.restaurantModel.countDocuments({ status: 'pending' });
        return { restaurants, users, bookings, orders, revenue: revenue[0]?.total || 0, pending };
    }

    async getSignupsByDay(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.userModel.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
    }

    async getBookingsByDay(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.reservationModel.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
    }

    async getCuisineDistribution() {
        return this.restaurantModel.aggregate([
            { $group: { _id: '$cuisineType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);
    }

    async getRestaurantDashboard(restaurantId: string) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        const [todayReservations, pendingOrders, monthRevenue, rating, activeTables] = await Promise.all([
            this.reservationModel.countDocuments({ restaurantId, date: { $gte: today, $lte: todayEnd } }),
            this.orderModel.countDocuments({ restaurantId, status: { $in: ['placed', 'confirmed', 'preparing'] } }),
            this.orderModel.aggregate([
                { $match: { restaurantId, status: OrderStatus.DELIVERED, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            this.restaurantModel.findById(restaurantId).select('rating totalReviews'),
            this.orderModel.countDocuments({ restaurantId, status: { $in: ['placed', 'confirmed', 'preparing', 'ready'] } }),
        ]);

        const revenueLastWeek = await this.orderModel.aggregate([
            { $match: { restaurantId, status: OrderStatus.DELIVERED } },
            { $group: { _id: { $dateToString: { format: '%a', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
            { $sort: { _id: 1 } },
        ]);

        return {
            todayReservations,
            pendingOrders,
            monthRevenue: monthRevenue[0]?.total || 0,
            rating: rating?.rating || 0,
            totalReviews: rating?.totalReviews || 0,
            activeTables,
            revenueChart: revenueLastWeek,
        };
    }

    async getReservationsHeatmap(restaurantId: string) {
        const since = new Date();
        since.setDate(since.getDate() - 28);
        return this.reservationModel.aggregate([
            { $match: { restaurantId, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { day: { $dayOfWeek: '$date' }, hour: { $substr: ['$time', 0, 2] } },
                    count: { $sum: 1 },
                }
            },
        ]);
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / analytics / analytics.controller.ts << 'EOF'
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
EOF

cat > /home/claude / tablenest / backend / src / modules / analytics / analytics.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Order, OrderSchema } from '../orders/order.schema';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { User, UserSchema } from '../users/user.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Reservation.name, schema: ReservationSchema },
            { name: User.name, schema: UserSchema },
            { name: Restaurant.name, schema: RestaurantSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }