import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'percentage', enum: ['percentage', 'flat'] })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: [] })
  applicableCategories: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  code: string;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
