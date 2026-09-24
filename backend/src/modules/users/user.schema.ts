import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  OWNER = 'owner',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/** Fields that must never leave the server. They are `select: false` and also stripped by toJSON. */
export const PRIVATE_USER_FIELDS = ['password', 'resetPasswordToken', 'resetPasswordExpires', 'tokenVersion', 'failedLoginAttempts', 'lockUntil'];

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      for (const f of PRIVATE_USER_FIELDS) delete ret[f];
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: UserRole.CUSTOMER, enum: UserRole, index: true })
  role: UserRole;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({ type: String, default: null })
  avatar: string | null;

  @Prop({ type: String, default: null })
  address: string | null;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'Restaurant' })
  restaurantId: Types.ObjectId | null;

  @Prop({ type: Object, default: { bookingConfirmation: true, marketing: false, orderTracking: true } })
  notificationPrefs: {
    bookingConfirmation: boolean;
    marketing: boolean;
    orderTracking: boolean;
  };

  @Prop({ type: String, default: null, select: false })
  resetPasswordToken: string | null;

  @Prop({ type: Date, default: null, select: false })
  resetPasswordExpires: Date | null;

  /** Bumped on password change/reset, logout-all and deactivation — invalidates every issued JWT. */
  @Prop({ default: 0, select: false })
  tokenVersion: number;

  @Prop({ default: 0, select: false })
  failedLoginAttempts: number;

  @Prop({ type: Date, default: null, select: false })
  lockUntil: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Restaurant' }], default: [] })
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

  /** Display metadata only (brand, last4, expiry). Card numbers and CVVs are never stored. */
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
