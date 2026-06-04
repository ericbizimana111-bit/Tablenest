import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: [{ referredUserId: Types.ObjectId, email: String, name: String, status: String, reward: Number, invitedAt: Date }], default: [] })
  referrals: Array<{
    referredUserId: Types.ObjectId;
    email: string;
    name: string;
    status: string;
    reward: number;
    invitedAt: Date;
  }>;

  @Prop({ default: 0 })
  totalEarned: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
