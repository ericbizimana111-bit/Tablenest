import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  tableId: Types.ObjectId;

  @Prop({ default: null })
  tableNumber: string;

  @Prop({ default: null })
  restaurantName: string;

  @Prop({ default: null })
  restaurantImage: string;

  @Prop({ default: null })
  customerName: string;

  @Prop({ default: null })
  customerPhone: string;

  /** Stored as UTC midnight of the booking day so the calendar date never shifts. */
  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true, min: 1, max: 20 })
  guests: number;

  @Prop({ default: ReservationStatus.PENDING, enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ default: null })
  specialRequests: string;

  @Prop({ default: null })
  cancelReason: string;

  @Prop({ default: null })
  bookingRef: string;

  @Prop({ default: null })
  qrCode: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ restaurantId: 1, date: 1, status: 1 });
