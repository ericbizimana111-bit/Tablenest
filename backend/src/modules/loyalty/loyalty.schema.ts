import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyDocument = Loyalty & Document;

@Schema({ timestamps: true })
export class Loyalty {
  @Prop({ required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  points: number;

  @Prop({ type: [{ type: String, points: Number, description: String, date: Date }], default: [] })
  transactions: Array<{ type: string; points: number; description: string; date: Date }>;
}

export const LoyaltySchema = SchemaFactory.createForClass(Loyalty);
