import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  items: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;

  @Prop({ required: true })
  total: number;

  @Prop({ default: OrderStatus.PLACED, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ default: null })
  deliveryAddress: string;

  @Prop({ default: null })
  driverId: Types.ObjectId;

  @Prop({ default: null })
  estimatedDelivery: Date;

  @Prop({ default: null })
  notes: string;

  @Prop({ default: null })
  tableId: Types.ObjectId;

  @Prop({ type: [{ status: String, time: Date, note: String }], default: [] })
  statusHistory: Array<{ status: string; time: Date; note: string }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
