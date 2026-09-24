import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Reservation, ReservationDocument, ReservationStatus } from '../reservations/reservation.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';
import { Table, TableDocument, TableStatus } from '../tables/table.schema';

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  private series(rows: Array<{ _id: string; [k: string]: any }>, days: number, fields: string[]) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const map = new Map(rows.map((r) => [r._id, r]));
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = dayKey(d);
      const row = map.get(key);
      const out: Record<string, any> = { date: key, label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
      fields.forEach((f) => (out[f] = row?.[f] || 0));
      return out;
    });
  }

  async getRestaurantDashboard(restaurantId: string) {
    const rid = new Types.ObjectId(restaurantId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const utcToday = new Date(`${dayKey(new Date())}T00:00:00.000Z`);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(startOfDay);
    weekStart.setDate(weekStart.getDate() - 6);

    const [todayReservations, pendingReservations, pendingOrders, monthRevenue, todayRevenue, restaurant, tables, week, topItems, recentOrders, upcoming] =
      await Promise.all([
        this.reservationModel.countDocuments({ restaurantId: rid, date: utcToday, status: { $nin: [ReservationStatus.CANCELLED] } }),
        this.reservationModel.countDocuments({ restaurantId: rid, status: ReservationStatus.PENDING }),
        this.orderModel.countDocuments({ restaurantId: rid, status: { $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] } }),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: OrderStatus.DELIVERED, createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: startOfDay, $lt: endOfDay } } },
          { $group: { _id: null, total: { $sum: '$total' }, n: { $sum: 1 } } },
        ]),
        this.restaurantModel.findById(restaurantId).select('rating totalReviews name'),
        this.tableModel.find({ restaurantId: rid }),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: weekStart } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED } } },
          { $unwind: '$items' },
          { $group: { _id: '$items.name', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, image: { $first: '$items.image' } } },
          { $sort: { sold: -1 } },
          { $limit: 5 },
        ]),
        this.orderModel.find({ restaurantId: rid }).sort({ createdAt: -1 }).limit(6),
        this.reservationModel
          .find({ restaurantId: rid, date: { $gte: utcToday }, status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] } })
          .sort({ date: 1, time: 1 })
          .limit(6),
      ]);

    return {
      restaurantName: restaurant?.name,
      todayReservations,
      pendingReservations,
      pendingOrders,
      monthRevenue: monthRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders: todayRevenue[0]?.n || 0,
      rating: restaurant?.rating || 0,
      totalReviews: restaurant?.totalReviews || 0,
      activeTables: tables.filter((t) => t.status === TableStatus.OCCUPIED).length,
      totalTables: tables.length,
      revenueChart: this.series(week, 7, ['revenue', 'orders']),
      topItems: topItems.map((t) => ({ name: t._id, sold: t.sold, revenue: t.revenue, image: t.image })),
      recentOrders,
      upcomingReservations: upcoming,
    };
  }

  async getOverview(restaurantId: string, days = 30) {
    days = Math.min(180, Math.max(7, Number(days) || 30));
    const rid = new Types.ObjectId(restaurantId);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const live = { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: since } };

    const [daily, types, top, totals, customers, resDaily, resStatus] = await Promise.all([
      this.orderModel.aggregate([
        { $match: live },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate([{ $match: live }, { $group: { _id: '$orderType', orders: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      this.orderModel.aggregate([
        { $match: live },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { sold: -1 } },
        { $limit: 8 },
      ]),
      this.orderModel.aggregate([{ $match: live }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }]),
      this.orderModel.aggregate([{ $match: live }, { $group: { _id: '$customerId', n: { $sum: 1 } } }]),
      this.reservationModel.aggregate([
        { $match: { restaurantId: rid, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, bookings: { $sum: 1 }, guests: { $sum: '$guests' } } },
      ]),
      this.reservationModel.aggregate([{ $match: { restaurantId: rid, createdAt: { $gte: since } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);

    const orders = totals[0]?.orders || 0;
    const revenue = totals[0]?.revenue || 0;
    const repeat = customers.filter((c) => c.n > 1).length;
    return {
      days,
      revenue,
      orders,
      averageOrder: orders ? Math.round((revenue / orders) * 100) / 100 : 0,
      customers: customers.length,
      repeatRate: customers.length ? Math.round((repeat / customers.length) * 100) : 0,
      daily: this.series(daily, days, ['revenue', 'orders']),
      bookingsDaily: this.series(resDaily, days, ['bookings', 'guests']),
      orderTypes: types.map((t) => ({ type: t._id, orders: t.orders, revenue: t.revenue })),
      topItems: top.map((t) => ({ name: t._id, sold: t.sold, revenue: t.revenue })),
      reservationStatus: resStatus.map((s) => ({ status: s._id, count: s.n })),
    };
  }

  async getReservationsHeatmap(restaurantId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 56);
    const rows = await this.reservationModel.aggregate([
      { $match: { restaurantId: new Types.ObjectId(restaurantId), date: { $gte: since }, status: { $ne: ReservationStatus.CANCELLED } } },
      { $group: { _id: { day: { $dayOfWeek: '$date' }, hour: { $substr: ['$time', 0, 2] } }, count: { $sum: 1 } } },
    ]);
    return rows.map((r) => ({ day: r._id.day, hour: Number(r._id.hour), count: r.count }));
  }
}
