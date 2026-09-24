import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument, RestaurantPlan } from './platform-settings.schema';
import { UpdateSettingsDto } from './settings.dto';

export type Settings = Pick<
  PlatformSettings,
  'currency' | 'requireRestaurantApproval' | 'serviceFeeRate' | 'serviceFeeCap' | 'bookingFeePerCover' | 'plans' | 'sponsoredWeeklyFee' | 'loyaltyPointsPerUnit'
>;

const CACHE_MS = 30_000;
const money = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class SettingsService {
  private cache: { value: Settings; at: number } | null = null;

  constructor(@InjectModel(PlatformSettings.name) private model: Model<PlatformSettingsDocument>) {}

  /** Current settings (created with defaults on first use). Cached briefly — safe across instances. */
  async get(): Promise<Settings> {
    if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.value;
    const doc = await this.model.findOneAndUpdate(
      { key: 'platform' },
      { $setOnInsert: { key: 'platform' } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    const o = doc.toObject();
    const value: Settings = {
      currency: o.currency,
      requireRestaurantApproval: o.requireRestaurantApproval,
      serviceFeeRate: o.serviceFeeRate,
      serviceFeeCap: o.serviceFeeCap,
      bookingFeePerCover: o.bookingFeePerCover,
      plans: o.plans,
      sponsoredWeeklyFee: o.sponsoredWeeklyFee,
      loyaltyPointsPerUnit: o.loyaltyPointsPerUnit,
    };
    this.cache = { value, at: Date.now() };
    return value;
  }

  async update(dto: UpdateSettingsDto) {
    const current = await this.get();
    const set: Record<string, unknown> = { ...dto };
    if (dto.plans) set.plans = { ...current.plans, ...dto.plans };
    await this.model.updateOne({ key: 'platform' }, { $set: set }, { upsert: true, runValidators: true });
    this.cache = null;
    return this.get();
  }

  /** Commission rate for a restaurant: its admin-set override, else its plan's rate. */
  static commissionRate(settings: Settings, restaurant: { plan?: string; commissionRate?: number | null }) {
    if (typeof restaurant.commissionRate === 'number') return restaurant.commissionRate;
    const plan = (restaurant.plan as RestaurantPlan) || RestaurantPlan.STARTER;
    return settings.plans[plan]?.commissionRate ?? settings.plans[RestaurantPlan.STARTER].commissionRate;
  }

  static serviceFee(settings: Settings, base: number) {
    const fee = money(Math.max(0, base) * settings.serviceFeeRate);
    return settings.serviceFeeCap > 0 ? Math.min(fee, settings.serviceFeeCap) : fee;
  }
}
