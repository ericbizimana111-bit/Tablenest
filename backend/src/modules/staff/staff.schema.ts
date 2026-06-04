import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: 'staff' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  avatar: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
