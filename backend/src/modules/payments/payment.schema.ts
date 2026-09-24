import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/** One payment record per order: how the customer pays and whether it has been collected. */
@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'Order', unique: true, sparse: true })
  orderId: Types.ObjectId | null;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, default: null })
  currency: string | null;

  @Prop({ default: PaymentStatus.PENDING, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop({ default: 'cash', enum: ['cash', 'card'] })
  method: string;

  /** Gateway reference, once an online payment provider is integrated. */
  @Prop({ type: String, default: null })
  transactionId: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
