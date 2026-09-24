import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ReservationDocument = Reservation & Document;
export type ReservationSlotDocument = ReservationSlot & Document;

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/** Statuses that hold a table/seats. */
export const ACTIVE_RESERVATION_STATUSES = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.ARRIVED];

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'Table' })
  tableId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  tableNumber: string | null;

  @Prop({ type: String, default: null })
  restaurantName: string | null;

  @Prop({ type: String, default: null })
  restaurantImage: string | null;

  @Prop({ type: String, default: null })
  customerName: string | null;

  @Prop({ type: String, default: null })
  customerPhone: string | null;

  /** UTC midnight of the booking's calendar day (in the restaurant's time zone), so the date never shifts. */
  @Prop({ required: true, index: true })
  date: Date;

  /** Local wall-clock time at the restaurant, HH:MM. */
  @Prop({ required: true })
  time: string;

  @Prop({ required: true, min: 1, max: 20 })
  guests: number;

  @Prop({ default: ReservationStatus.PENDING, enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ type: String, default: null })
  specialRequests: string | null;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  @Prop({ type: String, default: null, unique: true, sparse: true })
  bookingRef: string | null;

  @Prop({ type: [{ status: String, time: Date, by: String, _id: false }], default: [] })
  statusHistory: Array<{ status: string; time: Date; by: string }>;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ restaurantId: 1, date: 1, status: 1 });
ReservationSchema.index({ customerId: 1, date: -1 });

/**
 * Concurrency guard for bookings. Each active reservation owns one document per 30-minute slot it
 * occupies. The unique index makes the database — not application code — reject a second booking
 * of the same table (or, for restaurants without tables, seats beyond capacity) in the same slot,
 * even when two requests arrive at the same instant on different servers.
 */
@Schema({ timestamps: true, collection: 'reservationslots' })
export class ReservationSlot {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  /** Minutes after local midnight at which the 30-minute slot starts. */
  @Prop({ required: true })
  slot: number;

  /** The locked table, or null for restaurants that book against total seating capacity. */
  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  tableId: Types.ObjectId | null;

  @Prop({ default: 0 })
  seats: number;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [], index: true })
  reservationIds: Types.ObjectId[];
}

export const ReservationSlotSchema = SchemaFactory.createForClass(ReservationSlot);
ReservationSlotSchema.index({ restaurantId: 1, date: 1, slot: 1, tableId: 1 }, { unique: true });
