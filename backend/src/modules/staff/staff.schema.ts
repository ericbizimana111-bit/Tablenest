import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId | null;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({ default: 'Server' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  avatar: string | null;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
