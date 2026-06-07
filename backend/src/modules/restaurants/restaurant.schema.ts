import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

export enum RestaurantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: Types.ObjectId;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true })
  cuisineType: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: [] })
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

  @Prop({ default: 0 })
  seatingCapacity: number;

  @Prop({ default: '$$', enum: ['$', '$$', '$$$', '$$$$'] })
  priceRange: string;

  @Prop({ default: RestaurantStatus.PENDING, enum: RestaurantStatus })
  status: RestaurantStatus;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ type: Object, default: {} })
  openingHours: Record<string, { open: string; close: string; closed: boolean }>;

  @Prop({ default: true })
  dineIn: boolean;

  @Prop({ default: false })
  delivery: boolean;

  @Prop({ default: null })
  commissionRate: number;

  @Prop({ default: null })
  location: { lat: number; lng: number };

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: null })
  rejectionReason: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
