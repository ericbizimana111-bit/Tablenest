import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

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

export enum OrderType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  DINE_IN = 'dine_in',
}

export interface OrderLine {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  notes?: string | null;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ unique: true, sparse: true })
  orderNumber: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  customerId: Types.ObjectId;

  /** Client-generated key (Idempotency-Key header) so a retried or double-clicked checkout creates one order. */
  @Prop({ default: undefined })
  clientRequestId: string;

  @Prop({ default: null })
  customerName: string;

  @Prop({ default: null })
  customerPhone: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', index: true })
  restaurantId: Types.ObjectId;

  @Prop({ default: null })
  restaurantName: string;

  @Prop({ default: null })
  restaurantImage: string;

  @Prop({
    type: [
      {
        menuItemId: { type: MongooseSchema.Types.ObjectId },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        notes: String,
        _id: false,
      },
    ],
    required: true,
  })
  items: OrderLine[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: null })
  promoCode: string;

  @Prop({ default: 0 })
  deliveryFee: number;

  /** Customer-paid platform service fee. */
  @Prop({ default: 0 })
  serviceFee: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  tip: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: null })
  currency: string;

  /** Platform commission fixed at checkout (rate × food subtotal after discount). Not shown to customers. */
  @Prop({ default: 0, select: false })
  commissionRate: number;

  @Prop({ default: 0, select: false })
  commissionAmount: number;

  /** Loyalty voucher consumed by this order, restored if the order is cancelled. */
  @Prop({ default: null, select: false })
  voucherCode: string;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, select: false })
  promotionId: Types.ObjectId;

  @Prop({ default: OrderType.DELIVERY, enum: OrderType })
  orderType: OrderType;

  @Prop({ default: 'cash', enum: ['cash', 'card'] })
  paymentMethod: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'refunded'] })
  paymentStatus: string;

  @Prop({ default: null })
  cardLast4: string;

  @Prop({ default: OrderStatus.PLACED, enum: OrderStatus, index: true })
  status: OrderStatus;

  @Prop({ default: null })
  deliveryAddress: string;

  @Prop({ default: null })
  estimatedDelivery: Date;

  @Prop({ default: null })
  notes: string;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'Table' })
  tableId: Types.ObjectId;

  @Prop({ default: null })
  tableNumber: string;

  @Prop({ default: false })
  reviewed: boolean;

  @Prop({ type: [{ status: String, time: Date, note: String, by: String, _id: false }], default: [] })
  statusHistory: Array<{ status: string; time: Date; note: string; by?: string }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index(
  { customerId: 1, clientRequestId: 1 },
  { unique: true, partialFilterExpression: { clientRequestId: { $type: 'string' } } },
);
