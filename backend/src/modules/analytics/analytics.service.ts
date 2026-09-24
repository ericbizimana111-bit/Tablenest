import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { ACTIVE_STATUSES } from '../orders/orders.service';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Reservation, ReservationDocument, ReservationStatus } from '../reservations/reservation.schema';
import { RestaurantDocument } from '../restaurants/restaurant.schema';
import { Table, TableDocument, TableStatus } from '../tables/table.schema';
import { dayStart, startOfLocalDay, zonedNow } from '../../common/utils/time';

const DAY = 86400000;

/** Owner dashboard figures. Every number is an aggregate over real orders and reservations. */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    private config: ConfigService,
  ) {}

  private tz(r: RestaurantDocument) {
    return r.timezone || this.config.get<string>('DEFAULT_TIMEZONE', 'UTC');
  }

  /** A zero-filled day-by-day series ending today (restaurant time). */
  private series(rows: Array<{ _id: string; [k: string]: unknown }>, days: number, fields: string[], timeZone: string) {
    const map = new Map(rows.map((r) => [r._id, r]));
    const todayStart = startOfLocalDay(timeZone);
    return Array.from({ length: days }, (_, i) => {
      const at = new Date(todayStart.getTime() - (days - 1 - i) * DAY + 12 * 3600000);
      const key = new Intl.DateTimeFormat('en-CA', { timeZone }).format(at);
      const out: Record<string, unknown> = { date: key, label: at.toLocaleDateString('en-US', { weekday: 'short', timeZone }) };
      const row = map.get(key);
      fields.forEach((f) => (out[f] = row?.[f] || 0));
      return out;
    });
  }

  async getRestaurantDashboard(restaurant: RestaurantDocument) {
    const rid = restaurant._id as Types.ObjectId;
    const timezone = this.tz(restaurant);
    const local = zonedNow(timezone);
    const startOfDay = startOfLocalDay(timezone);
    const monthStart = new Date(startOfDay.getTime() - (Number(local.date.slice(8, 10)) - 1) * DAY);
    const weekStart = new Date(startOfDay.getTime() - 6 * DAY);
    const bookingToday = dayStart(local.date);

    const [todayReservations, pendingReservations, pendingOrders, monthRevenue, todayRevenue, tables, week, topItems, recentOrders, upcoming] =
      await Promise.all([
        this.reservationModel.countDocuments({ restaurantId: rid, date: bookingToday, status: { $ne: ReservationStatus.CANCELLED } }),
        this.reservationModel.countDocuments({ restaurantId: rid, status: ReservationStatus.PENDING }),
        this.orderModel.countDocuments({ restaurantId: rid, status: { $in: ACTIVE_STATUSES } }),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: OrderStatus.DELIVERED, createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: '$total' }, n: { $sum: 1 } } },
        ]),
        this.tableModel.find({ restaurantId: rid }).select('status'),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: weekStart } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
        this.orderModel.aggregate([
          { $match: { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: new Date(Date.now() - 90 * DAY) } } },
          { $unwind: '$items' },
          { $group: { _id: '$items.name', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, image: { $first: '$items.image' } } },
          { $sort: { sold: -1 } },
          { $limit: 5 },
        ]),
        this.orderModel.find({ restaurantId: rid }).sort({ createdAt: -1 }).limit(6),
        this.reservationModel
          .find({ restaurantId: rid, date: { $gte: bookingToday }, status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] } })
          .sort({ date: 1, time: 1 })
          .limit(6),
      ]);

    return {
      restaurantName: restaurant.name,
      todayReservations,
      pendingReservations,
      pendingOrders,
      monthRevenue: monthRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders: todayRevenue[0]?.n || 0,
      rating: restaurant.rating || 0,
      totalReviews: restaurant.totalReviews || 0,
      activeTables: tables.filter((t) => t.status === TableStatus.OCCUPIED).length,
      totalTables: tables.length,
      revenueChart: this.series(week, 7, ['revenue', 'orders'], timezone),
      topItems: topItems.map((t) => ({ name: t._id, sold: t.sold, revenue: t.revenue, image: t.image })),
      recentOrders,
      upcomingReservations: upcoming,
    };
  }

  async getOverview(restaurant: RestaurantDocument, days = 30) {
    days = Math.min(180, Math.max(7, days));
    const rid = restaurant._id as Types.ObjectId;
    const timezone = this.tz(restaurant);
    const since = new Date(startOfLocalDay(timezone).getTime() - (days - 1) * DAY);
    const live = { restaurantId: rid, status: { $ne: OrderStatus.CANCELLED }, createdAt: { $gte: since } };
    const byDay = (field: string) => ({ $dateToString: { format: '%Y-%m-%d', date: field, timezone } });

    const [daily, types, top, totals, customers, resDaily, resStatus] = await Promise.all([
      this.orderModel.aggregate([{ $match: live }, { $group: { _id: byDay('$createdAt'), revenue: { $sum: '$total' }, orders: { $sum: 1 } } }]),
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
        { $group: { _id: byDay('$createdAt'), bookings: { $sum: 1 }, guests: { $sum: '$guests' } } },
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
      daily: this.series(daily, days, ['revenue', 'orders'], timezone),
      bookingsDaily: this.series(resDaily, days, ['bookings', 'guests'], timezone),
      orderTypes: types.map((t) => ({ type: t._id, orders: t.orders, revenue: t.revenue })),
      topItems: top.map((t) => ({ name: t._id, sold: t.sold, revenue: t.revenue })),
      reservationStatus: resStatus.map((s) => ({ status: s._id, count: s.n })),
    };
  }

  /** Bookings by weekday (1 = Sunday) and hour over the last 8 weeks. */
  async getReservationsHeatmap(restaurant: RestaurantDocument) {
    const rows = await this.reservationModel.aggregate([
      { $match: { restaurantId: restaurant._id, date: { $gte: new Date(Date.now() - 56 * DAY) }, status: { $ne: ReservationStatus.CANCELLED } } },
      { $group: { _id: { day: { $dayOfWeek: '$date' }, hour: { $substr: ['$time', 0, 2] } }, count: { $sum: 1 } } },
    ]);
    return rows.map((r) => ({ day: r._id.day, hour: Number(r._id.hour), count: r.count }));
  }
}
