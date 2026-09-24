import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { ACTIVE_STATUSES } from '../orders/orders.service';
import { Reservation, ReservationDocument, ReservationStatus } from '../reservations/reservation.schema';
import { Upload, UploadDocument } from '../uploads/upload.schema';
import { AuditLog, AuditLogDocument } from '../../common/audit/audit-log.schema';
import { AuditService } from '../../common/audit/audit.service';
import { BillingService, currentPeriod } from '../billing/billing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { escapeRegex, pageParams } from '../../common/dto/pagination.dto';
import type { Actor } from '../../common/services/access-control.service';
import {
  AdminOrdersQueryDto,
  AdminReservationsQueryDto,
  AdminRestaurantsQueryDto,
  AdminUpdateUserDto,
  AdminUploadsQueryDto,
  AdminUsersQueryDto,
  AuditQueryDto,
  RestaurantStatusDto,
} from './admin.dto';
import { dayStart } from '../../common/utils/time';

const page = async <T>(query: Promise<T[]>, count: Promise<number>, p: number, limit: number) => {
  const [items, total] = await Promise.all([query, count]);
  return { items, total, page: p, pages: Math.ceil(total / limit) };
};

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>,
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
    private audit: AuditService,
    private billing: BillingService,
    private notifications: NotificationsService,
  ) {}

  /** Platform health at a glance. Every figure is a live count/aggregate. */
  async stats() {
    const since = new Date(Date.now() - 86400000);
    const period = currentPeriod();
    const [usersByRole, restaurantsByStatus, ordersByStatus, orders24h, gmv, reservations24h, revenue] = await Promise.all([
      this.userModel.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
      this.restaurantModel.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      this.orderModel.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      this.orderModel.countDocuments({ createdAt: { $gte: since } }),
      this.orderModel.aggregate([{ $match: { status: OrderStatus.DELIVERED } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      this.reservationModel.countDocuments({ createdAt: { $gte: since } }),
      this.billing.revenue(period, period),
    ]);
    const obj = (rows: Array<{ _id: string; n: number }>) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
    return {
      users: obj(usersByRole),
      restaurants: obj(restaurantsByStatus),
      orders: obj(ordersByStatus),
      ordersLast24h: orders24h,
      reservationsLast24h: reservations24h,
      grossMerchandiseValue: gmv[0]?.total || 0,
      platformRevenueThisMonth: { period, currency: revenue.currency, total: revenue.total, collected: revenue.collected, outstanding: revenue.outstanding },
    };
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  listUsers(q: AdminUsersQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 25);
    const filter: Record<string, unknown> = {};
    if (q.role) filter.role = q.role;
    if (q.isActive) filter.isActive = q.isActive === 'true';
    if (q.search) {
      const rx = { $regex: escapeRegex(q.search), $options: 'i' };
      filter.$or = [{ fullName: rx }, { email: rx }];
    }
    return page(this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(), this.userModel.countDocuments(filter).exec(), p, limit);
  }

  async updateUser(actor: Actor, id: string, dto: AdminUpdateUserDto) {
    if (actor._id.toString() === id) throw new ForbiddenException('You cannot change your own account from the admin panel');
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) throw new ForbiddenException('Admin accounts are managed from the server CLI');
    if (dto.role && dto.role !== user.role && (await this.restaurantModel.exists({ ownerId: user._id }))) {
      throw new BadRequestException('This user owns a restaurant; reassign or remove it before changing their role');
    }

    const update: Record<string, unknown> = { ...dto };
    // Deactivating, or changing role, revokes every session the user holds.
    if (dto.isActive === false || (dto.role && dto.role !== user.role)) update.$inc = { tokenVersion: 1 };
    const updated = await this.userModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    if (dto.isActive === false && user.role === UserRole.OWNER) {
      await this.restaurantModel.updateOne({ ownerId: user._id }, { status: RestaurantStatus.SUSPENDED, acceptingOrders: false });
    }
    await this.audit.record(actor, 'admin.user_updated', { type: 'user', id }, { ...dto });
    return updated;
  }

  // ── Restaurants ───────────────────────────────────────────────────────────
  listRestaurants(q: AdminRestaurantsQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 25);
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.search) {
      const rx = { $regex: escapeRegex(q.search), $options: 'i' };
      filter.$or = [{ name: rx }, { city: rx }, { cuisineType: rx }];
    }
    return page(
      this.restaurantModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('ownerId', 'fullName email isActive').exec(),
      this.restaurantModel.countDocuments(filter).exec(),
      p,
      limit,
    );
  }

  async setRestaurantStatus(actor: Actor, id: string, dto: RestaurantStatusDto) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const update: Record<string, unknown> = { status: dto.status, rejectionReason: dto.reason || null };
    if (dto.status === RestaurantStatus.ACTIVE && !restaurant.approvedAt) update.approvedAt = new Date();
    const updated = await this.restaurantModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    await this.audit.record(actor, 'admin.restaurant_status', { type: 'restaurant', id }, { from: restaurant.status, to: dto.status, reason: dto.reason });

    const copy: Record<string, [string, string]> = {
      [RestaurantStatus.ACTIVE]: ['Your restaurant is live', `${restaurant.name} is now visible to customers.`],
      [RestaurantStatus.REJECTED]: ['Restaurant application not approved', dto.reason || ''],
      [RestaurantStatus.SUSPENDED]: ['Your restaurant has been suspended', dto.reason || ''],
    };
    const msg = copy[dto.status];
    if (msg) {
      this.notifications
        .create(restaurant.ownerId.toString(), { title: msg[0], message: msg[1], type: NotificationType.SYSTEM, link: '/owner/settings' })
        .catch(() => undefined);
    }
    return updated;
  }

  // ── Orders & reservations ─────────────────────────────────────────────────
  listOrders(q: AdminOrdersQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 25);
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status === 'active' ? { $in: ACTIVE_STATUSES } : q.status;
    if (q.restaurantId) filter.restaurantId = new Types.ObjectId(q.restaurantId);
    if (q.customerId) filter.customerId = new Types.ObjectId(q.customerId);
    return page(this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(), this.orderModel.countDocuments(filter).exec(), p, limit);
  }

  listReservations(q: AdminReservationsQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 25);
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.restaurantId) filter.restaurantId = new Types.ObjectId(q.restaurantId);
    if (q.date) filter.date = dayStart(q.date);
    return page(
      this.reservationModel.find(filter).sort({ date: -1, time: -1 }).skip(skip).limit(limit).exec(),
      this.reservationModel.countDocuments(filter).exec(),
      p,
      limit,
    );
  }

  /** Recreates missing booking-fee entries for completed reservations (idempotent). */
  async reconcileBookingFees(sinceDays = 90) {
    let checked = 0;
    const cursor = this.reservationModel
      .find({ status: ReservationStatus.COMPLETED, updatedAt: { $gte: new Date(Date.now() - sinceDays * 86400000) } })
      .cursor();
    for await (const r of cursor) {
      await this.billing.recordBookingFee(r);
      checked++;
    }
    return { reservationsChecked: checked };
  }

  // ── Uploads & audit ───────────────────────────────────────────────────────
  listUploads(q: AdminUploadsQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 50);
    const filter: Record<string, unknown> = {};
    if (q.ownerId) filter.ownerId = new Types.ObjectId(q.ownerId);
    return page(
      this.uploadModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('ownerId', 'fullName email role').exec(),
      this.uploadModel.countDocuments(filter).exec(),
      p,
      limit,
    );
  }

  listAudit(q: AuditQueryDto) {
    const { page: p, limit, skip } = pageParams(q, 50);
    const filter: Record<string, unknown> = {};
    if (q.action) filter.action = q.action;
    if (q.actorId) filter.actorId = new Types.ObjectId(q.actorId);
    return page(this.auditModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(), this.auditModel.countDocuments(filter).exec(), p, limit);
  }
}
