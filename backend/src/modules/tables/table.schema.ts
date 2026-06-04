import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  tableNumber: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ default: TableStatus.AVAILABLE, enum: TableStatus })
  status: TableStatus;

  @Prop({ default: null })
  currentGuestId: Types.ObjectId;

  @Prop({ default: null })
  seatedAt: Date;

  @Prop({ default: null })
  serverNotes: string;

  @Prop({ default: null })
  qrCode: string;

  @Prop({
    type: {
      x:Number,
      y:Number,
    }
  })

  postion:{
    x:number,
    y:number,
  }

}

export const TableSchema = SchemaFactory.createForClass(Table);
