import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ORDER = 'order',
  BOOKING = 'booking',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REVIEW = 'review',
  PAYMENT = 'payment',
}

@Schema({ timestamps: true })

export class Notification {

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: NotificationType.SYSTEM, enum: NotificationType })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  link: string;

  @Prop({ default: null })
  metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
