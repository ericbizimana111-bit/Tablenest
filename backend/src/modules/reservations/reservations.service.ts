import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ACTIVE_RESERVATION_STATUSES, Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { Table, TableDocument, TableStatus } from '../tables/table.schema';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ReferralsService } from '../referrals/referrals.service';
import { BillingService } from '../billing/billing.service';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { AuditService } from '../../common/audit/audit.service';
import { DAYS, dayOfWeek, dayStart, isDateString, toMinutes, toTime, zonedNow } from '../../common/utils/time';
import { SLOT_MINUTES, SlotLockService, slotsFor } from './slot-lock.service';
import {
  AvailabilityQueryDto,
  CreateReservationDto,
  RestaurantReservationsQueryDto,
  UpdateReservationDto,
} from './reservations.dto';

const LAST_SEATING_BEFORE_CLOSE = 60;
export const MIN_LEAD_MINUTES = 30;
export const MAX_ADVANCE_DAYS = 90;
const MAX_ACTIVE_PER_CUSTOMER = 10;
const COMPLETION_POINTS = 50;

/** Allowed status moves. Customers may only cancel; everything else is the restaurant's call. */
export const RESERVATION_FLOW: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
  [ReservationStatus.CONFIRMED]: [ReservationStatus.ARRIVED, ReservationStatus.NO_SHOW, ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
  [ReservationStatus.ARRIVED]: [ReservationStatus.COMPLETED],
  [ReservationStatus.COMPLETED]: [],
  [ReservationStatus.CANCELLED]: [],
  [ReservationStatus.NO_SHOW]: [],
};
const TERMINAL = [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW];
/** Statuses that only make sense once the booking day has arrived. */
const DAY_OF_ONLY = [ReservationStatus.ARRIVED, ReservationStatus.COMPLETED, ReservationStatus.NO_SHOW];

const addDays = (date: string, n: number) => new Date(dayStart(date).getTime() + n * 86400000).toISOString().slice(0, 10);

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger('Reservations');

  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private locks: SlotLockService,
    private notifications: NotificationsService,
    private loyalty: LoyaltyService,
    private referrals: ReferralsService,
    private billing: BillingService,
    private access: AccessControlService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  private tz(r: { timezone?: string | null }) {
    return r.timezone || this.config.get<string>('DEFAULT_TIMEZONE', 'UTC');
  }

  private notify(userId: string, title: string, message: string, link: string, metadata?: Record<string, unknown>) {
    this.notifications.create(userId, { title, message, type: NotificationType.BOOKING, link, metadata }).catch(() => undefined);
  }

  // ── Rules ─────────────────────────────────────────────────────────────────
  /** Opening window for a date in minutes after local midnight; `close` may exceed 1440 for overnight hours. */
  private hoursFor(restaurant: RestaurantDocument, date: string) {
    const h = restaurant.openingHours?.[DAYS[dayOfWeek(date)]];
    if (!h) return { open: 10 * 60, close: 22 * 60 };
    if (h.closed) return null;
    const open = toMinutes(h.open || '10:00');
    let close = toMinutes(h.close || '22:00');
    if (close <= open) close += 24 * 60;
    return { open, close };
  }

  private async bookableRestaurant(restaurantId: string) {
    const restaurant = await this.restaurantModel.findOne({ _id: restaurantId, status: RestaurantStatus.ACTIVE });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (!restaurant.dineIn) throw new BadRequestException('This restaurant does not take table reservations');
    return restaurant;
  }

  /** Validates date/time against today (restaurant time), booking horizon, opening hours and slot grid. */
  private assertBookable(restaurant: RestaurantDocument, date: string, time: string) {
    if (!isDateString(date)) throw new BadRequestException('Choose a valid date');
    const local = zonedNow(this.tz(restaurant));
    if (date < local.date) throw new BadRequestException('That date is in the past');
    if (date > addDays(local.date, MAX_ADVANCE_DAYS)) {
      throw new BadRequestException(`Bookings can be made up to ${MAX_ADVANCE_DAYS} days ahead`);
    }
    const m = toMinutes(time);
    if (m % SLOT_MINUTES !== 0) throw new BadRequestException('Choose one of the available time slots');
    if (date === local.date && m < local.minutes + MIN_LEAD_MINUTES) {
      throw new BadRequestException(`Bookings must be made at least ${MIN_LEAD_MINUTES} minutes in advance`);
    }
    const hours = this.hoursFor(restaurant, date);
    if (!hours) throw new BadRequestException('The restaurant is closed on this day');
    if (m < hours.open || m > hours.close - LAST_SEATING_BEFORE_CLOSE) {
      throw new BadRequestException("That time is outside the restaurant's opening hours");
    }
    return m;
  }

  /**
   * Claims a table (smallest that fits) or seats for the booking. The unique slot index makes this
   * safe under concurrency: of two simultaneous requests for the last table, exactly one wins.
   */
  private async claim(restaurant: RestaurantDocument, date: string, startMin: number, guests: number, reservationId: Types.ObjectId) {
    const key = { restaurantId: restaurant._id as Types.ObjectId, date: dayStart(date) };
    if (await this.tableModel.exists({ restaurantId: restaurant._id })) {
      const tables = await this.tableModel
        .find({ restaurantId: restaurant._id, status: { $ne: TableStatus.BLOCKED }, capacity: { $gte: guests } })
        .sort({ capacity: 1, tableNumber: 1 });
      for (const table of tables) {
        if (await this.locks.lockTable(key, table._id as Types.ObjectId, startMin, guests, reservationId)) return { ok: true, table };
      }
      return { ok: false, table: null };
    }
    const ok = await this.locks.lockSeats(key, startMin, guests, restaurant.seatingCapacity || 0, reservationId);
    return { ok, table: null };
  }

  // ── Availability ──────────────────────────────────────────────────────────
  async getAvailability(q: AvailabilityQueryDto) {
    const guests = q.guests || 2;
    const date = q.date;
    if (!isDateString(date)) throw new BadRequestException('A valid date (YYYY-MM-DD) is required');
    const restaurant = await this.bookableRestaurant(q.restaurantId);
    const local = zonedNow(this.tz(restaurant));
    if (date < local.date || date > addDays(local.date, MAX_ADVANCE_DAYS)) return { date, closed: false, guests, slots: [] };

    const hours = this.hoursFor(restaurant, date);
    if (!hours) return { date, closed: true, guests, slots: [] };

    const [tables, locks] = await Promise.all([
      this.tableModel.find({ restaurantId: restaurant._id, status: { $ne: TableStatus.BLOCKED } }).lean(),
      this.locks.forDay({ restaurantId: restaurant._id as Types.ObjectId, date: dayStart(date) }),
    ]);
    const hasTables = tables.length > 0 || !!(await this.tableModel.exists({ restaurantId: restaurant._id }));
    const tableTaken = new Set(locks.filter((l) => l.tableId).map((l) => `${String(l.tableId)}:${l.slot}`));
    const seatsAt = new Map(locks.filter((l) => !l.tableId).map((l) => [l.slot, l.seats]));
    const capacity = restaurant.seatingCapacity || 0;

    const fits = (m: number) => {
      const need = slotsFor(m);
      if (hasTables) return tables.some((t) => t.capacity >= guests && need.every((s) => !tableTaken.has(`${String(t._id)}:${s}`)));
      return need.every((s) => (seatsAt.get(s) || 0) + guests <= capacity);
    };

    const slots: Array<{ time: string; available: boolean }> = [];
    for (let m = hours.open; m <= hours.close - LAST_SEATING_BEFORE_CLOSE; m += SLOT_MINUTES) {
      if (m >= 24 * 60) break; // after-midnight seatings belong to the next calendar day
      const past = date === local.date && m < local.minutes + MIN_LEAD_MINUTES;
      slots.push({ time: toTime(m), available: !past && fits(m) });
    }
    return { date, closed: false, guests, slots };
  }

  // ── Create / modify ───────────────────────────────────────────────────────
  async create(customer: Actor, dto: CreateReservationDto) {
    const customerId = customer._id.toString();
    const restaurant = await this.bookableRestaurant(dto.restaurantId);
    const m = this.assertBookable(restaurant, dto.date, dto.time);

    const sameDay = await this.reservationModel.find({
      customerId,
      restaurantId: restaurant._id,
      date: dayStart(dto.date),
      status: { $in: ACTIVE_RESERVATION_STATUSES },
    });
    if (sameDay.some((r) => Math.abs(toMinutes(r.time) - m) < slotsFor(0).length * SLOT_MINUTES)) {
      throw new ConflictException('You already have a booking at this restaurant around that time');
    }
    const upcoming = await this.reservationModel.countDocuments({
      customerId,
      status: { $in: ACTIVE_RESERVATION_STATUSES },
      date: { $gte: dayStart(zonedNow(this.tz(restaurant)).date) },
    });
    if (upcoming >= MAX_ACTIVE_PER_CUSTOMER) {
      throw new BadRequestException(`You can hold at most ${MAX_ACTIVE_PER_CUSTOMER} upcoming bookings`);
    }

    const reservationId = new Types.ObjectId();
    const { ok, table } = await this.claim(restaurant, dto.date, m, dto.guests, reservationId);
    if (!ok) throw new ConflictException('Sorry, that time is fully booked. Please choose another slot.');

    const user = await this.userModel.findById(customerId).select('fullName phone');
    let reservation: ReservationDocument;
    try {
      reservation = await this.reservationModel.create({
        _id: reservationId,
        customerId,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.images?.[0] || null,
        customerName: user?.fullName || null,
        customerPhone: dto.phone || user?.phone || null,
        date: dayStart(dto.date),
        time: dto.time,
        guests: dto.guests,
        tableId: table?._id || null,
        tableNumber: table?.tableNumber || null,
        specialRequests: dto.notes || dto.specialRequests || null,
        bookingRef: 'TN-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
        status: ReservationStatus.PENDING,
        statusHistory: [{ status: ReservationStatus.PENDING, time: new Date(), by: 'customer' }],
      });
    } catch (err) {
      await this.locks.releaseAll(reservationId, dto.guests);
      throw err;
    }

    this.logger.log(`reservation.created id=${reservationId.toString()} restaurant=${restaurant._id.toString()} date=${dto.date} time=${dto.time} guests=${dto.guests}`);
    this.notify(
      restaurant.ownerId.toString(),
      'New booking request',
      `${user?.fullName || 'A guest'} · ${dto.guests} guests · ${dto.date} at ${dto.time}`,
      '/owner/reservations',
      { reservationId },
    );
    this.notify(
      customerId,
      'Booking request sent',
      `${restaurant.name} · ${dto.date} at ${dto.time} for ${dto.guests}. We'll notify you once it's confirmed.`,
      '/my-bookings',
      { reservationId },
    );
    return reservation;
  }

  /** Customer reschedules; the booking goes back to `pending` for the restaurant to re-confirm. */
  async update(actor: Actor, id: string, dto: UpdateReservationDto) {
    const existing = await this.reservationModel.findById(id);
    if (!existing) throw new NotFoundException('Reservation not found');
    if (existing.customerId.toString() !== actor._id.toString()) throw new ForbiddenException('You cannot change this reservation');
    if (![ReservationStatus.PENDING, ReservationStatus.CONFIRMED].includes(existing.status)) {
      throw new BadRequestException('Only pending or confirmed reservations can be changed');
    }
    const restaurant = await this.bookableRestaurant(existing.restaurantId.toString());
    const date = dto.date ?? existing.date.toISOString().slice(0, 10);
    const time = dto.time ?? existing.time;
    const guests = dto.guests ?? existing.guests;
    const m = this.assertBookable(restaurant, date, time);
    const rid = existing._id as Types.ObjectId;

    let table: TableDocument | null = null;
    if (await this.tableModel.exists({ restaurantId: restaurant._id })) {
      // Claim the new slots first (own overlapping locks are reused), then drop the old ones.
      const res = await this.claim(restaurant, date, m, guests, rid);
      if (!res.ok) throw new ConflictException('That time is not available. Please choose another slot.');
      table = res.table;
      await this.locks.releaseAll(rid, existing.guests, { tableId: table!._id as Types.ObjectId, date: dayStart(date), slots: slotsFor(m) });
    } else {
      await this.locks.releaseAll(rid, existing.guests);
      const res = await this.claim(restaurant, date, m, guests, rid);
      if (!res.ok) {
        const restored = await this.claim(restaurant, existing.date.toISOString().slice(0, 10), toMinutes(existing.time), existing.guests, rid);
        if (!restored.ok) this.locks.logInconsistency(`reservation ${id} lost its seats while rescheduling`);
        throw new ConflictException('That time is not available. Please choose another slot.');
      }
    }

    const updated = await this.reservationModel.findByIdAndUpdate(
      id,
      {
        date: dayStart(date),
        time,
        guests,
        tableId: table?._id || null,
        tableNumber: table?.tableNumber || null,
        status: ReservationStatus.PENDING,
        ...(dto.notes !== undefined ? { specialRequests: dto.notes } : {}),
        $push: { statusHistory: { status: ReservationStatus.PENDING, time: new Date(), by: 'customer' } },
      },
      { returnDocument: 'after' },
    );
    this.logger.log(`reservation.rescheduled id=${id} date=${date} time=${time} guests=${guests}`);
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
    return this.reservationModel.find({ customerId }).sort({ date: -1, time: -1 }).limit(200);
  }

  async findByRestaurant(user: Actor, restaurantId: string, query: RestaurantReservationsQueryDto) {
    const restaurant = await this.access.assertRestaurantOwner(user, restaurantId);
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const filter: Record<string, unknown> = { restaurantId: restaurant._id };
    if (query.status && query.status !== 'all') filter.status = { $in: query.status.split(',') };
    if (query.date) filter.date = dayStart(query.date);
    if (query.upcoming === 'true') {
      filter.date = { $gte: dayStart(zonedNow(this.tz(restaurant)).date) };
      filter.status = { $in: ACTIVE_RESERVATION_STATUSES };
    }
    const [reservations, total] = await Promise.all([
      this.reservationModel.find(filter).sort({ date: 1, time: 1 }).skip((page - 1) * limit).limit(limit),
      this.reservationModel.countDocuments(filter),
    ]);
    return { reservations, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string, user: Actor) {
    const r = await this.reservationModel.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');
    if (r.customerId.toString() === user._id.toString()) return r;
    if (await this.access.managesRestaurant(user, r.restaurantId.toString())) return r;
    // Same answer as a missing record, so ids cannot be probed.
    throw new NotFoundException('Reservation not found');
  }

  // ── Status changes ────────────────────────────────────────────────────────
  async setStatus(user: Actor, id: string, status: ReservationStatus, reason?: string | null) {
    const r = await this.reservationModel.findById(id);
    if (!r) throw new NotFoundException('Reservation not found');

    const isCustomer = r.customerId.toString() === user._id.toString() && user.role === UserRole.CUSTOMER;
    let restaurant: RestaurantDocument | null = null;
    if (!isCustomer) restaurant = await this.access.assertRestaurantOwner(user, r.restaurantId.toString());
    if (isCustomer && status !== ReservationStatus.CANCELLED) throw new ForbiddenException('Only the restaurant can do that');

    if (!RESERVATION_FLOW[r.status].includes(status)) {
      throw new BadRequestException(`A ${r.status} booking cannot be marked ${status}`);
    }
    if (DAY_OF_ONLY.includes(status)) {
      restaurant ??= await this.restaurantModel.findById(r.restaurantId);
      const today = zonedNow(this.tz(restaurant || {})).date;
      if (r.date.toISOString().slice(0, 10) > today) throw new BadRequestException(`A booking can only be marked ${status} on or after its date`);
    }

    const by = isCustomer ? 'customer' : user.role === UserRole.ADMIN ? 'admin' : 'restaurant';
    const update: Record<string, unknown> = {
      status,
      $push: { statusHistory: { status, time: new Date(), by } },
    };
    if (status === ReservationStatus.CANCELLED) update.cancelReason = reason || (isCustomer ? 'Cancelled by guest' : 'Cancelled by restaurant');

    // Conditional on the status we validated against, so concurrent changes cannot both apply.
    const updated = await this.reservationModel.findOneAndUpdate({ _id: r._id, status: r.status }, update, { returnDocument: 'after' });
    if (!updated) throw new ConflictException('This booking was just updated — refresh and try again');

    if (TERMINAL.includes(status)) await this.locks.releaseAll(r._id as Types.ObjectId, r.guests);
    if (r.tableId) {
      if (status === ReservationStatus.ARRIVED) {
        await this.tableModel.updateOne({ _id: r.tableId }, { status: TableStatus.OCCUPIED, seatedAt: new Date(), currentGuestId: r.customerId });
      } else if (TERMINAL.includes(status)) {
        await this.tableModel.updateOne(
          { _id: r.tableId, currentGuestId: r.customerId, status: { $in: [TableStatus.OCCUPIED, TableStatus.RESERVED] } },
          { status: TableStatus.AVAILABLE, currentGuestId: null, seatedAt: null },
        );
      }
    }

    this.logger.log(`reservation.status id=${id} ${r.status}->${status} by=${by}`);
    if (by === 'admin') await this.audit.record(user, 'admin.reservation_status', { type: 'reservation', id }, { from: r.status, to: status });

    const customerId = r.customerId.toString();
    const when = `${r.date.toISOString().slice(0, 10)} at ${r.time}`;
    if (status === ReservationStatus.CONFIRMED) {
      this.notify(customerId, 'Booking confirmed', `${r.restaurantName} · ${when} for ${r.guests}. Ref ${r.bookingRef}.`, '/my-bookings');
    } else if (status === ReservationStatus.CANCELLED) {
      if (!isCustomer) {
        this.notify(customerId, 'Booking cancelled', `${r.restaurantName} cancelled your booking on ${when}.`, '/my-bookings');
      } else {
        const owner = await this.restaurantModel.findById(r.restaurantId).select('ownerId');
        if (owner) this.notify(owner.ownerId.toString(), 'Booking cancelled', `${r.customerName || 'A guest'} cancelled their booking on ${when}.`, '/owner/reservations');
      }
    } else if (status === ReservationStatus.COMPLETED) {
      this.loyalty.addPoints(customerId, COMPLETION_POINTS, `Dining at ${r.restaurantName}`).catch(() => undefined);
      this.referrals.completeForUser(customerId).catch(() => undefined);
      await this.billing.recordBookingFee(updated);
      this.notify(customerId, 'Thanks for dining with us', `You earned ${COMPLETION_POINTS} points at ${r.restaurantName}.`, '/rewards');
    }
    return updated;
  }

  // ── Dashboard data ────────────────────────────────────────────────────────
  async getCalendarData(user: Actor, restaurantId: string, month: number, year: number) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const reservations = await this.reservationModel
      .find({ restaurantId: new Types.ObjectId(restaurantId), date: { $gte: start, $lt: end } })
      .select('date status guests');
    const grouped: Record<string, { confirmed: number; pending: number; cancelled: number; noShow: number; completed: number; guests: number }> = {};
    for (const r of reservations) {
      const key = r.date.toISOString().slice(0, 10);
      const g = (grouped[key] ||= { confirmed: 0, pending: 0, cancelled: 0, noShow: 0, completed: 0, guests: 0 });
      if (r.status === ReservationStatus.CONFIRMED || r.status === ReservationStatus.ARRIVED) g.confirmed++;
      else if (r.status === ReservationStatus.PENDING) g.pending++;
      else if (r.status === ReservationStatus.CANCELLED) g.cancelled++;
      else if (r.status === ReservationStatus.NO_SHOW) g.noShow++;
      else if (r.status === ReservationStatus.COMPLETED) g.completed++;
      if (ACTIVE_RESERVATION_STATUSES.includes(r.status)) g.guests += r.guests;
    }
    return grouped;
  }

  async getStats(user: Actor, restaurantId: string) {
    const restaurant = await this.access.assertRestaurantOwner(user, restaurantId);
    const match = { restaurantId: restaurant._id };
    const today = dayStart(zonedNow(this.tz(restaurant)).date);
    const [total, todayTotal, confirmed, pending, todayGuests] = await Promise.all([
      this.reservationModel.countDocuments(match),
      this.reservationModel.countDocuments({ ...match, date: today, status: { $in: ACTIVE_RESERVATION_STATUSES } }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.CONFIRMED, date: { $gte: today } }),
      this.reservationModel.countDocuments({ ...match, status: ReservationStatus.PENDING }),
      this.reservationModel.aggregate([
        { $match: { ...match, date: today, status: { $in: ACTIVE_RESERVATION_STATUSES } } },
        { $group: { _id: null, guests: { $sum: '$guests' } } },
      ]),
    ]);
    return { total, todayTotal, confirmed, pending, todayGuests: todayGuests[0]?.guests || 0 };
  }
}
