import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  tableNumber: string;

  @Prop({ required: true, min: 1, max: 30 })
  capacity: number;

  @Prop({ default: TableStatus.AVAILABLE, enum: TableStatus })
  status: TableStatus;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  currentGuestId: Types.ObjectId;

  @Prop({ default: null })
  seatedAt: Date;

  @Prop({ default: null })
  serverNotes: string;

  @Prop({ default: null })
  qrCode: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);
