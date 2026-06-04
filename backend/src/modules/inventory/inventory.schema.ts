import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'units' })
  unit: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  minQuantity: number;

  @Prop({ default: null })
  supplier: string;

  @Prop({ default: null })
  cost: number;

  @Prop({ default: null })
  lastRestocked: Date;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
