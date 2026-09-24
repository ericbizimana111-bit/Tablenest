import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  customerId: Types.ObjectId;

  @Prop({ default: null })
  customerName: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  orderId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  reservationId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: null })
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: null })
  ownerReply: string;

  @Prop({ default: null })
  ownerRepliedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
// One review per order and per visit — enforced by the database, not just a pre-check.
ReviewSchema.index({ orderId: 1 }, { unique: true, partialFilterExpression: { orderId: { $type: 'objectId' } } });
ReviewSchema.index({ reservationId: 1 }, { unique: true, partialFilterExpression: { reservationId: { $type: 'objectId' } } });
ReviewSchema.index({ restaurantId: 1, createdAt: -1 });
