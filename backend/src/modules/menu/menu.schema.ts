import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;
export type MenuCategoryDocument = MenuCategory & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: null })
  image: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isSoldOut: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  preparationTime: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ name: 'text', description: 'text' });

@Schema({ timestamps: true })
export class MenuCategory {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
