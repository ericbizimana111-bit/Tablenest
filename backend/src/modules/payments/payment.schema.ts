import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  orderId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
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
