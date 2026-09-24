import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Promotion, PromotionDocument } from './promotion.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { AccessControlService, Actor } from '../../common/services/access-control.service';
import { CreatePromotionDto, UpdatePromotionDto } from './promotions.dto';

const money = (n: number) => Math.round(n * 100) / 100;
const startOfDay = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00.000Z`);
const endOfDay = (s: string) => new Date(`${s.slice(0, 10)}T23:59:59.999Z`);

/** A priced order line as the promotion engine sees it. */
export type PromoLine = { price: number; quantity: number; categoryId: string; categoryName?: string };

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: Actor, id: string) {
    const doc = await this.promotionModel.findById(id);
    if (!doc) throw new NotFoundException('Promotion not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  private normalise(dto: UpdatePromotionDto, existing?: PromotionDocument) {
    const out: Record<string, unknown> = { ...dto };
    if (dto.startDate) out.startDate = startOfDay(dto.startDate);
    if (dto.endDate) out.endDate = endOfDay(dto.endDate);
    if (dto.code !== undefined) out.code = dto.code ? dto.code.toUpperCase() : null;
    const type = dto.discountType ?? existing?.discountType ?? 'percentage';
    const value = dto.discountValue ?? existing?.discountValue;
    if (type === 'percentage' && value !== undefined && value > 100) throw new BadRequestException('Percentage cannot exceed 100');
    const start = (out.startDate as Date) ?? existing?.startDate;
    const end = (out.endDate as Date) ?? existing?.endDate;
    if (start && end && end < start) throw new BadRequestException('End date must be after the start date');
    return out;
  }

  async findByRestaurant(user: Actor, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.promotionModel.find({ restaurantId }).sort({ createdAt: -1 });
  }

  /** Public: currently running promotions for a restaurant. */
  findActiveForRestaurant(restaurantId: string) {
    const now = new Date();
    return this.promotionModel
      .find({ restaurantId, isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
      .select('-usedCount -usageLimit')
      .sort({ discountValue: -1 });
  }

  /** Public: promotions across the platform for the landing page. */
  async featured(limit = 6) {
    limit = Math.min(24, Math.max(1, limit));
    const now = new Date();
    const promos = await this.promotionModel
      .find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
      .select('-usedCount -usageLimit')
      .sort({ discountValue: -1 })
      .limit(limit * 2);
    const restaurants = await this.restaurantModel
      .find({ _id: { $in: promos.map((p) => p.restaurantId) }, status: RestaurantStatus.ACTIVE })
      .select('name images city cuisineType');
    const byId = new Map(restaurants.map((r) => [r._id.toString(), r]));
    return {
      promotions: promos
        .filter((p) => byId.has(p.restaurantId.toString()))
        .slice(0, limit)
        .map((p) => ({ ...p.toObject(), restaurant: byId.get(p.restaurantId.toString()) })),
    };
  }

  async create(user: Actor, dto: CreatePromotionDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const clean = this.normalise(dto);
    if (clean.code && (await this.promotionModel.exists({ restaurantId, code: clean.code }))) {
      throw new ConflictException('You already have a promotion with this code');
    }
    return this.promotionModel.create({ ...clean, restaurantId });
  }

  async update(user: Actor, id: string, dto: UpdatePromotionDto) {
    const existing = await this.owned(user, id);
    const clean = this.normalise(dto, existing);
    if (clean.code && clean.code !== existing.code && (await this.promotionModel.exists({ restaurantId: existing.restaurantId, code: clean.code }))) {
      throw new ConflictException('You already have a promotion with this code');
    }
    return this.promotionModel.findByIdAndUpdate(id, { $set: clean }, { returnDocument: 'after', runValidators: true });
  }

  async delete(user: Actor, id: string) {
    await this.owned(user, id);
    await this.promotionModel.findByIdAndDelete(id);
    return { message: 'Promotion deleted' };
  }

  async toggle(user: Actor, id: string) {
    const promo = await this.owned(user, id);
    return this.promotionModel.findByIdAndUpdate(id, { isActive: !promo.isActive }, { returnDocument: 'after' });
  }

  // ── Checkout ─────────────────────────────────────────────────────────────
  private discountFor(promo: PromotionDocument, lines: PromoLine[]) {
    const scoped = promo.applicableCategories?.length
      ? lines.filter((l) => promo.applicableCategories.includes(l.categoryId) || (l.categoryName && promo.applicableCategories.includes(l.categoryName)))
      : lines;
    const base = scoped.reduce((s, l) => s + l.price * l.quantity, 0);
    const amount = promo.discountType === 'percentage' ? (base * promo.discountValue) / 100 : Math.min(promo.discountValue, base);
    return money(amount);
  }

  private hasCapacity(p: PromotionDocument) {
    return !(p.usageLimit > 0 && p.usedCount >= p.usageLimit);
  }

  /**
   * Resolves the promotion for an order. With a code: that code must be valid (errors explain why).
   * Without one: the best running code-less promotion the order qualifies for, if any.
   */
  async resolve(restaurantId: string, code: string | null, lines: PromoLine[], subtotal: number, currency: string) {
    const now = new Date();
    const running = { restaurantId, isActive: true, startDate: { $lte: now }, endDate: { $gte: now } };
    if (code) {
      const promo = await this.promotionModel.findOne({ ...running, code: code.trim().toUpperCase() });
      if (!promo) return null;
      if (!this.hasCapacity(promo)) throw new BadRequestException('This promo code has reached its usage limit');
      if (subtotal < promo.minOrder) throw new BadRequestException(`This code needs a minimum order of ${promo.minOrder} ${currency}`);
      const amount = this.discountFor(promo, lines);
      if (amount <= 0) throw new BadRequestException("This code doesn't apply to the items in your cart");
      return { promo, amount };
    }
    const candidates = await this.promotionModel.find({ ...running, $or: [{ code: null }, { code: '' }], minOrder: { $lte: subtotal } });
    let best: { promo: PromotionDocument; amount: number } | null = null;
    for (const promo of candidates) {
      if (!this.hasCapacity(promo)) continue;
      const amount = this.discountFor(promo, lines);
      if (amount > 0 && (!best || amount > best.amount)) best = { promo, amount };
    }
    return best;
  }

  /** Counts one use, atomically enforcing the usage limit. Returns false when the limit was just reached. */
  async claimUse(id: string | Types.ObjectId) {
    const res = await this.promotionModel.updateOne(
      { _id: id, $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
      { $inc: { usedCount: 1 } },
    );
    return res.modifiedCount === 1;
  }

  async releaseUse(id: string | Types.ObjectId) {
    await this.promotionModel.updateOne({ _id: id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
  }
}
