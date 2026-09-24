import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PlatformChargeDocument = PlatformCharge & Document;

export enum ChargeType {
  /** % of food sales on a delivered order, per the restaurant's plan. */
  COMMISSION = 'commission',
  /** Customer-paid service fee on an order, collected by the restaurant and owed to the platform. */
  SERVICE_FEE = 'service_fee',
  /** Per-guest fee for a completed reservation. */
  BOOKING_FEE = 'booking_fee',
  /** Monthly plan fee. */
  SUBSCRIPTION = 'subscription',
  /** Paid top-of-list placement. */
  SPONSORSHIP = 'sponsorship',
}

export enum ChargeStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  VOID = 'void',
}

/**
 * The platform's revenue ledger: what each restaurant owes TableNest. Every entry is derived from a
 * real event (a delivered order, a completed booking, a plan period, a sponsorship grant) and is
 * written at most once per source thanks to the unique `dedupeKey`.
 */
@Schema({ timestamps: true, collection: 'platformcharges' })
export class PlatformCharge {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, enum: ChargeType })
  type: ChargeType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  currency: string;

  /** Billing month, YYYY-MM (UTC). */
  @Prop({ required: true, index: true })
  period: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, default: null, enum: ['order', 'reservation', 'plan', 'sponsorship', null] })
  sourceType: string | null;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  sourceId: Types.ObjectId | null;

  /** e.g. `commission:<orderId>` or `subscription:<restaurantId>:2026-09`. */
  @Prop({ required: true, unique: true })
  dedupeKey: string;

  @Prop({ default: ChargeStatus.UNPAID, enum: ChargeStatus, index: true })
  status: ChargeStatus;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: Object, default: {} })
  meta: Record<string, unknown>;
}

export const PlatformChargeSchema = SchemaFactory.createForClass(PlatformCharge);
PlatformChargeSchema.index({ restaurantId: 1, period: 1, status: 1 });
