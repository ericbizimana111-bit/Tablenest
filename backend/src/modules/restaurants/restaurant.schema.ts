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
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', unique: true })
  ownerId: Types.ObjectId;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true, trim: true })
  cuisineType: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  address: string;

  @Prop({ default: null })
  city: string;

  @Prop({ default: null })
  country: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: null })
  email: string;

  @Prop({ default: null })
  website: string;

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
  @Prop({ default: null })
  timezone: string;

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

  @Prop({ default: RestaurantPlan.STARTER, enum: RestaurantPlan })
  plan: RestaurantPlan;

  /** Admin-negotiated commission override. `null` → the plan's rate applies. */
  @Prop({ default: null, type: Number, min: 0, max: 0.5 })
  commissionRate: number | null;

  /** Paid placement: listed first in discovery while in the future. */
  @Prop({ default: null, index: true })
  sponsoredUntil: Date;

  @Prop({ type: LocationSchema, default: () => ({ latitude: 0, longitude: 0 }) })
  location: Location;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: null })
  rejectionReason: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.index({ status: 1, rating: -1, totalReviews: -1 });
RestaurantSchema.index({ status: 1, cuisineType: 1 });
RestaurantSchema.index({ status: 1, city: 1 });
