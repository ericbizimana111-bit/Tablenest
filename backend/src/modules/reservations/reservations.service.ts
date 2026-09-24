import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { Table, TableDocument, TableStatus } from '../tables/table.schema';
import { User, UserDocument } from '../users/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ReferralsService } from '../referrals/referrals.service';
import { AccessControlService } from '../../common/services/access-control.service';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOT_MINUTES = 30;
const DWELL_MINUTES = 90;
const LAST_SEATING_BEFORE_CLOSE = 60;
const MIN_LEAD_MINUTES = 30;
const BLOCKING = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.ARRIVED];

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};
const toTime = (mins: number) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
const dayStart = (date: string) => new Date(`${date}T00:00:00.000Z`);
const isDateString = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notifications: NotificationsService,
    private loyalty: LoyaltyService,
    private referrals: ReferralsService,
    private access: AccessControlService,
  ) {}

  private notify(userId: string, title: string, message: string, link: string, metadata?: any) {
    this.notifications
      .create(userId, { title, message, type: NotificationType.BOOKING, link, metadata })
      .catch(() => undefined);
  }

  // ── Availability ──────────────────────────────────────────────────────────
  private hoursFor(restaurant: RestaurantDocument, date: string) {
    const dow = DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
    const h = restaurant.openingHours?.[dow];
    if (!h) return { open: 10 * 60, close: 22 * 60 };
    if (h.closed) return null;
    return { open: toMinutes(h.open || '10:00'), close: toMinutes(h.close || '22:00') };
  }

  /** Reservations on `date` that overlap [startMin, startMin + DWELL). */
  private overlapping(day: ReservationDocument[], startMin: number, excludeId?: string) {
    return day.filter(
      (r) =>
        r._id.toString() !== excludeId &&
        BLOCKING.includes(r.status) &&
        toMinutes(r.time) < startMin + DWELL_MINUTES &&
        startMin < toMinutes(r.time) + DWELL_MINUTES,
    );
  }

  /** Returns a table id (or null when seating is counted by capacity) if the party fits, else `false`. */
  private fit(
    tables: TableDocument[],
    capacity: number,
    day: ReservationDocument[],
    startMin: number,
    guests: number,
    excludeId?: string,
  ): { ok: boolean; table: TableDocument | null } {
    const overlap = this.overlapping(day, startMin, excludeId);
    if (tables.length) {
      const taken = new Set(overlap.map((r) => r.tableId?.toString()).filter(Boolean));
      const free = tables
        .filter((t) => t.status !== TableStatus.BLOCKED && t.capacity >= guests && !taken.has(t._id.toString()))
        .sort((a, b) => a.capacity - b.capacity);
      return free.length ? { ok: true, table: free[0] } : { ok: false, table: null };
    }
    const used = overlap.reduce((s, r) => s + r.guests, 0);
    return { ok: used + guests <= capacity, table: null };
  }

  private async context(restaurantId: string, date: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant || restaurant.status !== RestaurantStatus.ACTIVE) throw new NotFoundException('Restaurant not found');
    if (!restaurant.dineIn) throw new BadRequestException('This restaurant does not take table reservations');
    const [tables, day] = await Promise.all([
      this.tableModel.find({ restaurantId: restaurant._id }),
      this.reservationModel.find({ restaurantId: restaurant._id, date: dayStart(date) }),
    ]);
    const capacity = tables.length ? tables.reduce((s, t) => s + t.capacity, 0) : restaurant.seatingCapacity || 0;
    return { restaurant, tables, day, capacity };
  }

  async getAvailability(restaurantId: string, date: string, guests: number) {
    if (!isDateString(date)) throw new BadRequestException('A valid date (YYYY-MM-DD) is required');
    guests = Math.max(1, Math.min(20, Math.floor(guests) || 2));
    const { restaurant, tables, day, capacity } = await this.context(restaurantId, date);
    const hours = this.hoursFor(restaurant, date);
    if (!hours) return { date, closed: true, guests, slots: [] };

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (date < todayStr) return { date, closed: false, guests, slots: [] };

    const slots: Array<{ time: string; available: boolean }> = [];
    const last = hours.close > hours.open ? hours.close - LAST_SEATING_BEFORE_CLOSE : hours.close + 24 * 60 - LAST_SEATING_BEFORE_CLOSE;
    for (let m = hours.open; m <= last; m += SLOT_MINUTES) {
      const past = date === todayStr && m < nowMin + MIN_LEAD_MINUTES;
      const fits = !past && guests <= (tables.length ? Math.max(...tables.map((t) => t.capacity)) : capacity) && this.fit(tables, capacity, day, m, guests).ok;
      slots.push({ time: toTime(m), available: fits });
    }
    return { date, closed: false, guests, slots };
  }

  // ── Create / modify ───────────────────────────────────────────────────────
  private validateRequest(date: unknown, time: unknown, guests: unknown) {
    if (!isDateString(date)) throw new BadRequestException('Choose a valid date');
    if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) throw new BadRequestException('Choose a valid time');
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > 20) throw new BadRequestException('Guests must be between 1 and 20');
    const when = new Date(`${date}T${time}:00`);
    if (isNaN(when.getTime()) || when.getTime() < Date.now() + MIN_LEAD_MINUTES * 60000) {
      throw new BadRequestException(`Bookings must be made at least ${MIN_LEAD_MINUTES} minutes in advance`);
    }
    return { date, time, guests: g };
  }

  async create(customerId: string, data: any) {
    if (!Types.ObjectId.isValid(data?.restaurantId)) throw new BadRequestException('restaurantId is required');
    const { date, time, guests } = this.validateRequest(data.date, data.time, data.guests);
    const { restaurant, tables, day, capacity } = await this.context(data.restaurantId, date);

    const hours = this.hoursFor(restaurant, date);
    const m = toMinutes(time);
    if (!hours) throw new BadRequestException('The restaurant is closed on this day');
    if (m < hours.open || m > (hours.close > hours.open ? hours.close - LAST_SEATING_BEFORE_CLOSE : hours.close + 1440)) {
      throw new BadRequestException('That time is outside the restaurant\'s opening hours');
    }

    const duplicate = day.find(
      (r) => r.customerId.toString() === customerId && r.time === time && BLOCKING.includes(r.status),
    );
    if (duplicate) throw new BadRequestException('You already have a booking at this restaurant for that time');

    const { ok, table } = this.fit(tables, capacity, day, m, guests);
    if (!ok) throw new BadRequestException('Sorry, that time just filled up. Please choose another slot.');

    const customer = await this.userModel.findById(customerId).select('fullName phone');
    const reservation = await this.reservationModel.create(<any>{
      customerId,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.images?.[0] || null,
      customerName: customer?.fullName || null,
      customerPhone: data.phone || customer?.phone || null,
      date: dayStart(date),
      time,
      guests,
      tableId: table?._id || null,
      tableNumber: table?.tableNumber || null,
      specialRequests: String(data.notes || data.specialRequests || '').trim().slice(0, 500) || null,
      bookingRef: 'TN-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      status: ReservationStatus.PENDING,
    });

    this.notify(
      restaurant.ownerId.toString(),
      'New booking request',
      `${customer?.fullName || 'A guest'} · ${guests} guests · ${date} at ${time}`,
      '/owner/reservations',
      { reservationId: reservation._id },
    );
    this.notify(
      customerId,
      'Booking request sent',
      `${restaurant.name} · ${date} at ${time} for ${guests}. We'll notify you once it's confirmed.`,
      '/my-bookings',
      { reservationId: reservation._id },
    );
    return reservation;
  }

  async update(id: string, actor: any, data: any) {
    const existing = await this.reservationModel.findById(id);
    if (!existing) throw new NotFoundException('Reservation not found');
    if (existing.customerId.toString() !== actor._id.toString()) throw new ForbiddenException('Cannot update this reservation');
    if (![ReservationStatus.PENDING, ReservationStatus.CONFIRMED].includes(existing.status)) {
      throw new BadRequestException('Only pending or confirmed reservations can be changed');
    }
    const date = data.date ?? existing.date.toISOString().slice(0, 10);
    const { time, guests } = this.validateRequest(date, data.time ?? existing.time, data.guests ?? existing.guests);
    const { restaurant, tables, day, capacity } = await this.context(existing.restaurantId.toString(), date);

    const { ok, table } = this.fit(tables, capacity, day, toMinutes(time), guests, id);
    if (!ok) throw new BadRequestException('That time is not available. Please choose another slot.');

    const updated = await this.reservationModel.findByIdAndUpdate(
      id,
      {
        date: dayStart(date),
        time,
        guests,
        tableId: table?._id || null,
        tableNumber: table?.tableNumber || null,
        status: ReservationStatus.PENDING,
        ...(data.notes !== undefined ? { specialRequests: String(data.notes).slice(0, 500) || null } : {}),
      },
      { returnDocument: 'after' },
    );
    this.notify(
      restaurant.ownerId.toString(),
      'Booking changed',
      `${existing.customerName || 'A guest'} moved their booking to ${date} at ${time} (${guests} guests). Please re-confirm.`,
      '/owner/reservations',
    );
    return updated;
  }

  // ── Reads ─────────────────────────────────────────────────────────────────
  findByCustomer(customerId: string) {
    return this.reservationModel.find({ customerId }).sort({ date: -1, time: -1 });
  }

  async findByRestaurant(user: any, restaurantId: string, query: any = {}) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    const { status, date } = query;
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(query.limit) || 50));
    const filter: any = { restaurantId: new Types.ObjectId(restaurantId) };
    if (status && status !== 'all') filter.status = { $in: String(status).split(',') };
    if (isDateString(date)) filter.date = dayStart(date);
    if (query.upcoming === 'true') {
      filter.date = { $gte: dayStart(new Date().toISOString().slice(0, 10)) };
      filter.status = { $in: BLOCKING };
    }
    const [reservations, total] = await Promise.all([
      this.reservationModel.find(filter).sort({ date: 1, time: 1 }).skip((page - 1) * limit).limit(limit),
      this.reservationModel.countDocuments(filter),
    ]);
    return { reservations, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string, user: any) {
    const r = await this.reservationModel.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');
    if (r.customerId.toString() !== user._id.toString()) {
      await this.access.assertRestaurantOwner(user, r.restaurantId.toString());
    }
    return r;
  }

  // ── Status changes ────────────────────────────────────────────────────────
  private async releaseTable(r: ReservationDocument) {
    if (r.tableId) {
      await this.tableModel.updateOne(
        { _id: r.tableId, status: { $in: [TableStatus.OCCUPIED, TableStatus.RESERVED] } },
        { status: TableStatus.AVAILABLE, currentGuestId: null, seatedAt: null },
      );
    }
  }

  async setStatus(user: any, id: string, status: ReservationStatus, reason?: string) {
    const r = await this.reservationModel.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');
    const isOwner = user.role === 'owner';
    const isCustomer = r.customerId.toString() === user._id.toString();
    if (isOwner) await this.access.assertRestaurantOwner(user, r.restaurantId.toString());
    else if (!isCustomer) throw new ForbiddenException('Access denied');

    const allowed: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
      [ReservationStatus.CONFIRMED]: [ReservationStatus.ARRIVED, ReservationStatus.NO_SHOW, ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
      [ReservationStatus.ARRIVED]: [ReservationStatus.COMPLETED],
      [ReservationStatus.COMPLETED]: [],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.NO_SHOW]: [],
    };
    if (!allowed[r.status].includes(status)) {
      throw new BadRequestException(`A ${r.status} booking cannot be marked ${status}`);
    }
    if (!isOwner && status !== ReservationStatus.CANCELLED) throw new ForbiddenException('Only the restaurant can do that');

    const update: any = { status };
    if (status === ReservationStatus.CANCELLED) update.cancelReason = reason || (isOwner ? 'Cancelled by restaurant' : 'Cancelled by guest');
    const updated = await this.reservationModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });

    if (r.tableId) {
      if (status === ReservationStatus.ARRIVED) {
        await this.tableModel.updateOne({ _id: r.tableId }, { status: TableStatus.OCCUPIED, seatedAt: new Date(), currentGuestId: r.customerId });
      } else if ([ReservationStatus.COMPLETED, ReservationStatus.NO_SHOW, ReservationStatus.CANCELLED].includes(status)) {
        await this.releaseTable(r);
      }
    }

    const customerId = r.customerId.toString();
    const when = `${r.date.toISOString().slice(0, 10)} at ${r.time}`;
    if (status === ReservationStatus.CONFIRMED) {
      this.notify(customerId, 'Booking confirmed', `${r.restaurantName} · ${when} for ${r.guests}. Ref ${r.bookingRef}.`, '/my-bookings');
    } else if (status === ReservationStatus.CANCELLED) {
      if (isOwner) {
        this.notify(customerId, 'Booking cancelled', `${r.restaurantName} cancelled your booking on ${when}.`, '/my-bookings');
      } else {
        const restaurant = await this.restaurantModel.findById(r.restaurantId).select('ownerId');
        if (restaurant) this.notify(restaurant.ownerId.toString(), 'Booking cancelled', `${r.customerName || 'A guest'} cancelled their booking on ${when}.`, '/owner/reservations');
      }
    } else if (status === ReservationStatus.COMPLETED) {
      this.loyalty.addPoints(customerId, 50, `Dining at ${r.restaurantName}`).catch(() => undefined);
      this.referrals.completeForUser(customerId).catch(() => undefined);
      this.notify(customerId, 'Thanks for dining with us', `You earned 50 points at ${r.restaurantName}.`, '/rewards');
    }
    return updated;
  }

  confirm(id: string, user: any) {
    return this.setStatus(user, id, ReservationStatus.CONFIRMED);
  }

  cancel(id: string, user: any, reason?: string) {
    return this.setStatus(user, id, ReservationStatus.CANCELLED, reason);
  }

  markArrived(id: string, user: any) {
    return this.setStatus(user, id, ReservationStatus.ARRIVED);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getCalendarData(user: any, restaurantId: string, month: number, year: number) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    if (!(month >= 1 && month <= 12) || !(year > 2000)) throw new BadRequestException('Invalid month or year');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const reservations = await this.reservationModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      date: { $gte: start, $lt: end },
    });
    const grouped: Record<string, any> = {};
    reservations.forEach((r) => {
      const key = r.date.toISOString().slice(0, 10);
      const g = (grouped[key] ||= { confirmed: 0, pending: 0, cancelled: 0, noShow: 0, completed: 0, guests: 0 });
      if (r.status === ReservationStatus.CONFIRMED || r.status === ReservationStatus.ARRIVED) g.confirmed++;
      else if (r.status === ReservationStatus.PENDING) g.pending++;
      else if (r.status === ReservationStatus.CANCELLED) g.cancelled++;
      else if (r.status === ReservationStatus.NO_SHOW) g.noShow++;
      else if (r.status === ReservationStatus.COMPLETED) g.completed++;
      if (BLOCKING.includes(r.status)) g.guests += r.guests;
    });
    return grouped;
  }

  async getStats(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    const match = { restaurantId: new Types.ObjectId(restaurantId) };
    const today = dayStart(new Date().toISOString().slice(0, 10));
    const [total, todayTotal, confirmed, pending, upcomingGuests] = await Promise.all([
      this.reservationModel.countDocuments(match),
      this.reservationModel.countDocuments({ ...match, date: today, status: { $in: BLOCKING } }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.CONFIRMED, date: { $gte: today } }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.PENDING }),
      this.reservationModel.aggregate([
        { $match: { ...match, date: today, status: { $in: BLOCKING } } },
        { $group: { _id: null, guests: { $sum: '$guests' } } },
      ]),
    ]);
    return { total, todayTotal, confirmed, pending, todayGuests: upcomingGuests[0]?.guests || 0 };
  }
}
