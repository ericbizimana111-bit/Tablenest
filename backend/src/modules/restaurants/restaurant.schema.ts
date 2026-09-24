import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { RestaurantPlan } from '../settings/platform-settings.schema';

export type RestaurantDocument = Restaurant & Document;

export enum RestaurantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

/** Commercial terms and moderation notes — visible to the owner and admins, never to the public. */
export const PRIVATE_RESTAURANT_FIELDS = ['commissionRate', 'plan', 'rejectionReason', 'sponsoredUntil'] as const;

@Schema({ _id: false })
export class Location {
  @Prop({ required: true, default: 0 })
  latitude: number;

  @Prop({ required: true, default: 0 })
  longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, trim: true })
  name: string;

  /** One restaurant per owner account. */
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ required: true, trim: true })
  cuisineType: string;

  @Prop({ type: String, default: null })
  logo: string | null;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  address: string;

  @Prop({ type: String, default: null })
  city: string | null;

  @Prop({ type: String, default: null })
  country: string | null;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({ type: String, default: null })
  email: string | null;

  @Prop({ type: String, default: null })
  website: string | null;

  @Prop({ default: 0, min: 0 })
  seatingCapacity: number;

  @Prop({ default: '$$', enum: ['$', '$$', '$$$', '$$$$'] })
  priceRange: string;

  @Prop({ default: RestaurantStatus.PENDING, enum: RestaurantStatus, index: true })
  status: RestaurantStatus;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ type: Object, default: {} })
  openingHours: Record<string, { open: string; close: string; closed: boolean }>;

  /** IANA zone (e.g. Africa/Kigali) used for opening hours and booking times. */
  @Prop({ type: String, default: null })
  timezone: string | null;

  @Prop({ default: true })
  dineIn: boolean;

  @Prop({ default: false })
  delivery: boolean;

  @Prop({ default: false })
  pickup: boolean;

  @Prop({ default: true })
  acceptingOrders: boolean;

  @Prop({ default: 0, min: 0 })
  deliveryFee: number;

  @Prop({ default: 0, min: 0 })
  minOrder: number;

  @Prop({ default: 0, min: 0, max: 0.4 })
  taxRate: number;

  @Prop({ default: 30, min: 5 })
  prepTime: number;

  @Prop({ type: String, default: RestaurantPlan.STARTER, enum: RestaurantPlan })
  plan: RestaurantPlan;

  /** Admin-negotiated commission override. `null` → the plan's rate applies. */
  @Prop({ default: null, type: Number, min: 0, max: 0.5 })
  commissionRate: number | null;

  /** Paid placement: listed first in discovery while in the future. */
  @Prop({ type: Date, default: null, index: true })
  sponsoredUntil: Date | null;

  @Prop({ type: LocationSchema, default: () => ({ latitude: 0, longitude: 0 }) })
  location: Location;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.index({ ownerId: 1 }, { unique: true, name: 'owner_unique' });
RestaurantSchema.index({ status: 1, rating: -1, totalReviews: -1 });
RestaurantSchema.index({ status: 1, cuisineType: 1 });
RestaurantSchema.index({ status: 1, city: 1 });
