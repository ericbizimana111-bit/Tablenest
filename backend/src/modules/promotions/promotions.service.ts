import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from './promotion.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: any, id: string) {
    const doc = await this.promotionModel.findById(id);
    if (!doc) throw new NotFoundException('Promotion not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  private clean(data: any, partial = false) {
    const out: Record<string, unknown> = {};
    if (!partial || data.name !== undefined) {
      const name = String(data.name || '').trim();
      if (!name) throw new BadRequestException('Promotion name is required');
      out.name = name;
    }
    if (data.description !== undefined) out.description = String(data.description).trim() || null;
    if (data.discountType !== undefined) {
      if (!['percentage', 'flat'].includes(data.discountType)) throw new BadRequestException('Invalid discount type');
      out.discountType = data.discountType;
    }
    if (!partial || data.discountValue !== undefined) {
      const v = Number(data.discountValue);
      if (!Number.isFinite(v) || v <= 0) throw new BadRequestException('Discount value must be greater than 0');
      if ((data.discountType ?? 'percentage') === 'percentage' && v > 100) throw new BadRequestException('Percentage cannot exceed 100');
      out.discountValue = v;
    }
    for (const key of ['minOrder', 'usageLimit']) {
      if (data[key] !== undefined && data[key] !== '') out[key] = Math.max(0, Number(data[key]) || 0);
    }
    if (!partial || data.startDate !== undefined) {
      const d = new Date(data.startDate);
      if (isNaN(d.getTime())) throw new BadRequestException('Start date is required');
      out.startDate = d;
    }
    if (!partial || data.endDate !== undefined) {
      const d = new Date(data.endDate);
      if (isNaN(d.getTime())) throw new BadRequestException('End date is required');
      d.setHours(23, 59, 59, 999);
      out.endDate = d;
    }
    if (out.startDate && out.endDate && (out.endDate as Date) < (out.startDate as Date)) {
      throw new BadRequestException('End date must be after the start date');
    }
    if (data.code !== undefined) out.code = String(data.code).trim().toUpperCase() || null;
    if (data.isActive !== undefined) out.isActive = !!data.isActive;
    return out;
  }

  async findByRestaurant(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.promotionModel.find({ restaurantId }).sort({ createdAt: -1 });
  }

  /** Public: currently running promotions for a restaurant. */
  async findActiveForRestaurant(restaurantId: string) {
    const now = new Date();
    return this.promotionModel
      .find({ restaurantId, isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
      .select('-usedCount -usageLimit')
      .sort({ discountValue: -1 });
  }

  /** Public: promotions across the platform for the landing page. */
  async featured(limit = 6) {
    const now = new Date();
    const promos = await this.promotionModel
      .find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
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

  async create(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const clean = this.clean(data);
    if (clean.code && (await this.promotionModel.exists({ restaurantId, code: clean.code }))) {
      throw new BadRequestException('You already have a promotion with this code');
    }
    return this.promotionModel.create({ ...clean, restaurantId });
  }

  async update(user: any, id: string, data: any) {
    await this.owned(user, id);
    return this.promotionModel.findByIdAndUpdate(id, { $set: this.clean(data, true) }, { returnDocument: 'after' });
  }

  async delete(user: any, id: string) {
    await this.owned(user, id);
    await this.promotionModel.findByIdAndDelete(id);
    return { message: 'Promotion deleted' };
  }

  async toggle(user: any, id: string) {
    const promo = await this.owned(user, id);
    return this.promotionModel.findByIdAndUpdate(id, { isActive: !promo.isActive }, { returnDocument: 'after' });
  }

  /** Validates a code for checkout and returns the discount for a subtotal. */
  async resolveCode(restaurantId: string, code: string, subtotal: number) {
    const now = new Date();
    const promo = await this.promotionModel.findOne({
      restaurantId,
      code: code.trim().toUpperCase(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    if (!promo) return null;
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('This promo code has reached its usage limit');
    }
    if (subtotal < promo.minOrder) {
      throw new BadRequestException(`This code needs a minimum order of $${promo.minOrder.toFixed(2)}`);
    }
    const amount =
      promo.discountType === 'percentage' ? (subtotal * promo.discountValue) / 100 : Math.min(promo.discountValue, subtotal);
    return { promo, amount: Math.round(amount * 100) / 100 };
  }

  async markUsed(id: string) {
    await this.promotionModel.updateOne({ _id: id }, { $inc: { usedCount: 1 } });
  }
}
