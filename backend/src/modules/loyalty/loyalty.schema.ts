import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type LoyaltyDocument = Loyalty & Document;

export interface LoyaltyTransaction {
  kind: 'earn' | 'redeem';
  points: number;
  description: string;
  date: Date;
}

export interface LoyaltyVoucher {
  code: string;
  title: string;
  discountType: 'percentage' | 'flat' | 'free_delivery';
  discountValue: number;
  expiresAt: Date;
  used: boolean;
}

@Schema({ timestamps: true })
export class Loyalty {
  @Prop({ required: true, unique: true, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  lifetimePoints: number;

  @Prop({
    type: [{ kind: String, points: Number, description: String, date: Date }],
    default: [],
  })
  transactions: LoyaltyTransaction[];

  @Prop({
    type: [
      {
        code: String,
        title: String,
        discountType: String,
        discountValue: Number,
        expiresAt: Date,
        used: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  vouchers: LoyaltyVoucher[];
}

export const LoyaltySchema = SchemaFactory.createForClass(Loyalty);
