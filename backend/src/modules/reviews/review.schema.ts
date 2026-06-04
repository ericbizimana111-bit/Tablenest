import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: null })
  comment: string;

  @Prop({ default: [] })
  images: string[];

  @Prop({ default: null })
  ownerReply: string;

  @Prop({ default: null })
  ownerRepliedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
