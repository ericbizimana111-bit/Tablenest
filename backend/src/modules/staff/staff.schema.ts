import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: 'Server' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  avatar: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
