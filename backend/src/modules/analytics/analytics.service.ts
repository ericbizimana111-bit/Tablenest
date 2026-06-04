import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Reservation, ReservationDocument } from '../reservations/reservation.schema';
import { User, UserDocument } from '../users/user.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';

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
        const pending = await this.restaurantModel.countDocuments({ status: RestaurantStatus.PENDING });
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
            this.orderModel.countDocuments({
                restaurantId,
                status: { $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
            }),
            this.orderModel.aggregate([
                { $match: { restaurantId, status: OrderStatus.DELIVERED, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            this.restaurantModel.findById(restaurantId).select('rating totalReviews'),
            this.orderModel.countDocuments({
                restaurantId,
                status: {
                    $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY],
                },
            }),
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


