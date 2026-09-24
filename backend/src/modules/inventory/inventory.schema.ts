import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'units' })
  unit: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  minQuantity: number;

  @Prop({ type: String, default: null })
  supplier: string | null;

  @Prop({ type: Number, default: null })
  cost: number | null;

  @Prop({ type: Date, default: null })
  lastRestocked: Date | null;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
