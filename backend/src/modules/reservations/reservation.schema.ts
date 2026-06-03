import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  @Prop({ required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  tableId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  guests: number;

  @Prop({ default: ReservationStatus.PENDING, enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ default: null })
  specialRequests: string;

  @Prop({ default: null })
  bookingRef: string;

  @Prop({ default: null })
  qrCode: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
