import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChargeStatus, ChargeType, PlatformCharge, PlatformChargeDocument } from './platform-charge.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { RestaurantPlan } from '../settings/platform-settings.schema';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../../common/audit/audit.service';
import type { Actor } from '../../common/services/access-control.service';

const money = (n: number) => Math.round(n * 100) / 100;
export const currentPeriod = (d = new Date()) => d.toISOString().slice(0, 7);
export const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

type OrderLike = {
  _id: unknown;
  restaurantId: Types.ObjectId;
  orderNumber?: string;
  commissionRate?: number;
  commissionAmount?: number;
  serviceFee?: number;
  subtotal: number;
  discount: number;
};
type ReservationLike = { _id: unknown; restaurantId: Types.ObjectId; guests: number; bookingRef?: string | null };

@Injectable()
export class BillingService {
  private readonly logger = new Logger('Billing');

  constructor(
    @InjectModel(PlatformCharge.name) private chargeModel: Model<PlatformChargeDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private settings: SettingsService,
    private audit: AuditService,
  ) {}

  /** Writes a ledger entry once; a repeated call for the same source returns the existing entry. */
  private async add(entry: Omit<PlatformCharge, 'status' | 'paidAt' | 'currency' | 'meta'> & { meta?: Record<string, unknown> }) {
    if (!(entry.amount > 0)) return null;
    const { currency } = await this.settings.get();
    try {
      const doc = await this.chargeModel.create({ ...entry, amount: money(entry.amount), currency });
      this.logger.log(`billing.charge ${entry.type} restaurant=${entry.restaurantId.toString()} amount=${doc.amount} ${currency}`);
      return doc;
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return this.chargeModel.findOne({ dedupeKey: entry.dedupeKey });
      throw err;
    }
  }

  /** Commission + service fee for a delivered order (amounts were fixed on the order at checkout). */
  async recordOrderRevenue(order: OrderLike) {
    const id = String(order._id);
    const period = currentPeriod();
    const commission = order.commissionAmount ?? 0;
    await this.add({
      restaurantId: order.restaurantId,
      type: ChargeType.COMMISSION,
      amount: commission,
      period,
      description: `Commission ${Math.round((order.commissionRate ?? 0) * 100)}% on order ${order.orderNumber || id}`,
      sourceType: 'order',
      sourceId: new Types.ObjectId(id),
      dedupeKey: `commission:${id}`,
      meta: { base: money(order.subtotal - order.discount), rate: order.commissionRate },
    });
    await this.add({
      restaurantId: order.restaurantId,
      type: ChargeType.SERVICE_FEE,
      amount: order.serviceFee ?? 0,
      period,
      description: `Service fee collected on order ${order.orderNumber || id}`,
      sourceType: 'order',
      sourceId: new Types.ObjectId(id),
      dedupeKey: `service_fee:${id}`,
    });
  }

  async recordBookingFee(reservation: ReservationLike) {
    const { bookingFeePerCover } = await this.settings.get();
    const id = String(reservation._id);
    await this.add({
      restaurantId: reservation.restaurantId,
      type: ChargeType.BOOKING_FEE,
      amount: bookingFeePerCover * reservation.guests,
      period: currentPeriod(),
      description: `Booking fee: ${reservation.guests} guest(s), booking ${reservation.bookingRef || id}`,
      sourceType: 'reservation',
      sourceId: new Types.ObjectId(id),
      dedupeKey: `booking_fee:${id}`,
      meta: { guests: reservation.guests, perCover: bookingFeePerCover },
    });
  }

  /** Bills every active restaurant on a paid plan for `period`. Safe to run repeatedly. */
  async chargeSubscriptions(actor: Actor, period = currentPeriod()) {
    if (!PERIOD_RE.test(period)) throw new BadRequestException('period must be YYYY-MM');
    const { plans } = await this.settings.get();
    const paidPlans = Object.entries(plans).filter(([, p]) => p.monthlyFee > 0).map(([k]) => k as RestaurantPlan);
    const restaurants = await this.restaurantModel.find({ status: RestaurantStatus.ACTIVE, plan: { $in: paidPlans } }).select('_id plan name');
    let created = 0;
    for (const r of restaurants) {
      const before = await this.chargeModel.exists({ dedupeKey: `subscription:${r._id.toString()}:${period}` });
      await this.add({
        restaurantId: r._id,
        type: ChargeType.SUBSCRIPTION,
        amount: plans[r.plan].monthlyFee,
        period,
        description: `${r.plan[0].toUpperCase()}${r.plan.slice(1)} plan — ${period}`,
        sourceType: 'plan',
        sourceId: r._id,
        dedupeKey: `subscription:${r._id.toString()}:${period}`,
      });
      if (!before) created++;
    }
    await this.audit.record(actor, 'admin.subscriptions_charged', undefined, { period, restaurants: restaurants.length, created });
    return { period, restaurants: restaurants.length, created };
  }

  async setPlan(actor: Actor, restaurantId: string, plan: RestaurantPlan, commissionRate?: number | null) {
    const update: Record<string, unknown> = { plan };
    if (commissionRate !== undefined) update.commissionRate = commissionRate;
    const restaurant = await this.restaurantModel.findByIdAndUpdate(restaurantId, update, { returnDocument: 'after', runValidators: true });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    await this.audit.record(actor, 'admin.restaurant_plan', { type: 'restaurant', id: restaurantId }, { plan, commissionRate });
    return restaurant;
  }

  /** Extends a sponsored placement by whole weeks and bills it. */
  async grantSponsorship(actor: Actor, restaurantId: string, weeks: number) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.status !== RestaurantStatus.ACTIVE) throw new BadRequestException('Only active restaurants can be sponsored');
    const { sponsoredWeeklyFee } = await this.settings.get();
    const from = restaurant.sponsoredUntil && restaurant.sponsoredUntil > new Date() ? restaurant.sponsoredUntil : new Date();
    const until = new Date(from.getTime() + weeks * 7 * 86400000);
    await this.restaurantModel.updateOne({ _id: restaurant._id }, { sponsoredUntil: until });
    const grantId = new Types.ObjectId();
    await this.add({
      restaurantId: restaurant._id,
      type: ChargeType.SPONSORSHIP,
      amount: sponsoredWeeklyFee * weeks,
      period: currentPeriod(),
      description: `Sponsored placement, ${weeks} week(s) until ${until.toISOString().slice(0, 10)}`,
      sourceType: 'sponsorship',
      sourceId: grantId,
      dedupeKey: `sponsorship:${grantId.toString()}`,
      meta: { weeks, weeklyFee: sponsoredWeeklyFee, until },
    });
    await this.audit.record(actor, 'admin.sponsorship_granted', { type: 'restaurant', id: restaurantId }, { weeks, until });
    return { sponsoredUntil: until };
  }

  private summarise(charges: Array<{ type: string; amount: number; status: ChargeStatus }>) {
    const byType: Record<string, number> = {};
    let unpaid = 0;
    let paid = 0;
    for (const c of charges) {
      if (c.status === ChargeStatus.VOID) continue;
      byType[c.type] = money((byType[c.type] || 0) + c.amount);
      if (c.status === ChargeStatus.PAID) paid += c.amount;
      else unpaid += c.amount;
    }
    return { byType, unpaid: money(unpaid), paid: money(paid), total: money(unpaid + paid) };
  }

  /** What a restaurant owes for one month, line by line. */
  async statement(restaurantId: string, period = currentPeriod()) {
    if (!PERIOD_RE.test(period)) throw new BadRequestException('period must be YYYY-MM');
    const [charges, settings, restaurant] = await Promise.all([
      this.chargeModel.find({ restaurantId, period }).sort({ createdAt: 1 }),
      this.settings.get(),
      this.restaurantModel.findById(restaurantId).select('plan commissionRate sponsoredUntil name'),
    ]);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const outstanding = await this.chargeModel.aggregate([
      { $match: { restaurantId: new Types.ObjectId(restaurantId), status: ChargeStatus.UNPAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return {
      restaurantId,
      restaurantName: restaurant.name,
      period,
      currency: settings.currency,
      plan: restaurant.plan,
      commissionRate: SettingsService.commissionRate(settings, restaurant),
      sponsoredUntil: restaurant.sponsoredUntil,
      charges,
      totals: this.summarise(charges),
      outstandingAllPeriods: money(outstanding[0]?.total || 0),
    };
  }

  async listCharges(filter: { restaurantId?: string; period?: string; status?: ChargeStatus; type?: ChargeType }, page: number, limit: number) {
    const q: Record<string, unknown> = {};
    if (filter.restaurantId) q.restaurantId = new Types.ObjectId(filter.restaurantId);
    if (filter.period) q.period = filter.period;
    if (filter.status) q.status = filter.status;
    if (filter.type) q.type = filter.type;
    const [charges, total] = await Promise.all([
      this.chargeModel.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.chargeModel.countDocuments(q),
    ]);
    return { charges, total, page, pages: Math.ceil(total / limit) };
  }

  /** Platform revenue between two periods (inclusive), by type and by month. */
  async revenue(from: string, to: string) {
    if (!PERIOD_RE.test(from) || !PERIOD_RE.test(to) || from > to) throw new BadRequestException('from/to must be YYYY-MM with from ≤ to');
    const match = { period: { $gte: from, $lte: to }, status: { $ne: ChargeStatus.VOID } };
    const [byType, byPeriod, byStatus, topRestaurants, settings] = await Promise.all([
      this.chargeModel.aggregate([{ $match: match }, { $group: { _id: '$type', amount: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { amount: -1 } }]),
      this.chargeModel.aggregate([{ $match: match }, { $group: { _id: '$period', amount: { $sum: '$amount' } } }, { $sort: { _id: 1 } }]),
      this.chargeModel.aggregate([{ $match: match }, { $group: { _id: '$status', amount: { $sum: '$amount' } } }]),
      this.chargeModel.aggregate([
        { $match: match },
        { $group: { _id: '$restaurantId', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'r' } },
        { $project: { amount: 1, name: { $arrayElemAt: ['$r.name', 0] } } },
      ]),
      this.settings.get(),
    ]);
    const status = Object.fromEntries(byStatus.map((s) => [s._id, money(s.amount)]));
    return {
      from,
      to,
      currency: settings.currency,
      total: money(byType.reduce((s, t) => s + t.amount, 0)),
      collected: status[ChargeStatus.PAID] || 0,
      outstanding: status[ChargeStatus.UNPAID] || 0,
      byType: byType.map((t) => ({ type: t._id, amount: money(t.amount), count: t.count })),
      byPeriod: byPeriod.map((p) => ({ period: p._id, amount: money(p.amount) })),
      topRestaurants: topRestaurants.map((r) => ({ restaurantId: r._id, name: r.name, amount: money(r.amount) })),
    };
  }

  /** Records payment received from a restaurant — for specific charges or a whole month. */
  async markPaid(actor: Actor, sel: { ids?: string[]; restaurantId?: string; period?: string }) {
    const q: Record<string, unknown> = { status: ChargeStatus.UNPAID };
    if (sel.ids?.length) q._id = { $in: sel.ids.map((i) => new Types.ObjectId(i)) };
    else if (sel.restaurantId && sel.period) Object.assign(q, { restaurantId: new Types.ObjectId(sel.restaurantId), period: sel.period });
    else throw new BadRequestException('Provide charge ids, or restaurantId and period');
    const res = await this.chargeModel.updateMany(q, { status: ChargeStatus.PAID, paidAt: new Date() });
    await this.audit.record(actor, 'admin.charges_marked_paid', undefined, { ...sel, updated: res.modifiedCount });
    return { updated: res.modifiedCount };
  }

  /** Voids every charge derived from one order/reservation. Returns how many were voided. */
  async voidForSource(sourceId: string, reason: string) {
    const res = await this.chargeModel.updateMany(
      { sourceId: new Types.ObjectId(sourceId), status: { $ne: ChargeStatus.VOID } },
      { status: ChargeStatus.VOID, $set: { 'meta.voidReason': reason } },
    );
    return res.modifiedCount;
  }

  async voidCharge(actor: Actor, id: string, reason: string) {
    const charge = await this.chargeModel.findOneAndUpdate(
      { _id: id, status: { $ne: ChargeStatus.VOID } },
      { status: ChargeStatus.VOID, $set: { 'meta.voidReason': reason } },
      { returnDocument: 'after' },
    );
    if (!charge) throw new NotFoundException('Charge not found or already void');
    await this.audit.record(actor, 'admin.charge_voided', { type: 'charge', id }, { reason });
    return charge;
  }
}
