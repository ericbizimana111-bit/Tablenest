import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: 'percentage', enum: ['percentage', 'flat'] })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0, min: 0 })
  minOrder: number;

  @Prop({ default: 0, min: 0 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: [String], default: [] })
  applicableCategories: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null, uppercase: true, trim: true })
  code: string;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
PromotionSchema.index({ restaurantId: 1, code: 1 });
