import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  OWNER = 'owner',
  CUSTOMER = 'customer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserRole.CUSTOMER, enum: UserRole })
  role: UserRole;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  address: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: null })
  restaurantId: Types.ObjectId;

  @Prop({ default: 'Gourmet Pro' })
  activePlan: string;

  @Prop({ type: Object, default: { bookingConfirmation: true, marketing: false, orderTracking: true } })
  notificationPrefs: {
    bookingConfirmation: boolean;
    marketing: boolean;
    orderTracking: boolean;
  };

  @Prop({ default: null })
  refreshToken: string;

  @Prop({ default: null })
  resetPasswordToken: string;

  @Prop({ default: null })
  resetPasswordExpires: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }], default: [] })
  favoriteRestaurantIds: Types.ObjectId[];

  @Prop({
    type: [{
      label: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      isDefault: { type: Boolean, default: false },
    }],
    default: [],
  })
  addresses: Array<{
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
  }>;

  @Prop({
    type: [{
      brand: String,
      last4: String,
      expiryMonth: String,
      expiryYear: String,
      isDefault: { type: Boolean, default: false },
    }],
    default: [],
  })
  paymentMethods: Array<{
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
