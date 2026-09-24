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
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: null })
  currency: string;

  @Prop({ default: PaymentStatus.PENDING, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop({ default: 'cash', enum: ['cash', 'card'] })
  method: string;

  /** Gateway reference, once an online payment provider is integrated. */
  @Prop({ default: null })
  transactionId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
