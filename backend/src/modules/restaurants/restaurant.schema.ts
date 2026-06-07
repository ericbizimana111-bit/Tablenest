import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

export enum RestaurantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

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
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId })
  ownerId: Types.ObjectId;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true })
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

  @Prop({ default: 0 })
  seatingCapacity: number;

  @Prop({
    default: '$$',
    enum: ['$', '$$', '$$$', '$$$$'],
  })
  priceRange: string;

  @Prop({
    default: RestaurantStatus.PENDING,
    enum: RestaurantStatus,
  })
  status: RestaurantStatus;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({
    type: Object,
    default: {},
  })
  openingHours: Record<
    string,
    {
      open: string;
      close: string;
      closed: boolean;
    }
  >;

  @Prop({ default: true })
  dineIn: boolean;

  @Prop({ default: false })
  delivery: boolean;

  @Prop({ default: null })
  commissionRate: number;

  @Prop({
    type: LocationSchema,
    default: () => ({
      latitude: 0,
      longitude: 0,
    }),
  })
  location: Location;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: null })
  rejectionReason: string;
}

export const RestaurantSchema =
  SchemaFactory.createForClass(Restaurant);