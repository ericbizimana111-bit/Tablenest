import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformSettingsDocument = PlatformSettings & Document;

export enum RestaurantPlan {
  STARTER = 'starter',
  PRO = 'pro',
}

/**
 * Platform-wide business configuration, edited by admins. A single document (`key: 'platform'`).
 * All money values are in `currency`; all rates are fractions (0.15 = 15%).
 */
@Schema({ timestamps: true, collection: 'platformsettings' })
export class PlatformSettings {
  @Prop({ required: true, unique: true, default: 'platform' })
  key: string;

  /** ISO 4217 code the whole marketplace trades in, e.g. USD, RWF, KES. */
  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  /** When true, new restaurants stay `pending` until an admin approves them. */
  @Prop({ default: false })
  requireRestaurantApproval: boolean;

  /** Customer-paid service fee on the food subtotal (after discounts). Platform revenue. */
  @Prop({ default: 0, min: 0, max: 0.3 })
  serviceFeeRate: number;

  /** Upper bound for the service fee per order; 0 means no cap. */
  @Prop({ default: 0, min: 0 })
  serviceFeeCap: number;

  /** Fee charged to the restaurant for each guest of a completed reservation. */
  @Prop({ default: 0, min: 0 })
  bookingFeePerCover: number;

  /** Commission (share of food sales) and monthly price for each restaurant plan. */
  @Prop({
    type: Object,
    default: () => ({
      [RestaurantPlan.STARTER]: { monthlyFee: 0, commissionRate: 0.15 },
      [RestaurantPlan.PRO]: { monthlyFee: 49, commissionRate: 0.1 },
    }),
  })
  plans: Record<RestaurantPlan, { monthlyFee: number; commissionRate: number }>;

  /** Weekly price of a sponsored (top-of-list) placement, charged when an admin grants one. */
  @Prop({ default: 25, min: 0 })
  sponsoredWeeklyFee: number;

  /** Loyalty points earned per 1 unit of currency spent on delivered orders. */
  @Prop({ default: 1, min: 0 })
  loyaltyPointsPerUnit: number;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
