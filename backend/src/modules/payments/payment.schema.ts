import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ default: null })
  orderId: Types.ObjectId;

  @Prop({ default: null })
  reservationId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: PaymentStatus.PENDING, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop({ default: 'card' })
  method: string;

  @Prop({ default: null })
  transactionId: string;

  @Prop({ default: null })
  last4: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
