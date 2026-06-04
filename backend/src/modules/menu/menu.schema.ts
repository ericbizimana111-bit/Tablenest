import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;
export type MenuCategoryDocument = MenuCategory & Document;

@Schema({ timestamps: true })


export class MenuItem {

  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  image: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isSoldOut: boolean;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: 0 })
  preparationTime: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

@Schema({ timestamps: true })

export class MenuCategory {

  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
