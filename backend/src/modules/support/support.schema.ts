import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketType {
  TECHNICAL = 'technical',
  ORDER = 'order',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: TicketType.OTHER, enum: TicketType })
  type: TicketType;

  @Prop({ default: TicketStatus.OPEN, enum: TicketStatus })
  status: TicketStatus;

  @Prop({ default: TicketPriority.MEDIUM, enum: TicketPriority })
  priority: TicketPriority;

  @Prop({ default: null })
  assignedTo: Types.ObjectId;

  @Prop({ type: [{ authorId: Types.ObjectId, message: String, createdAt: Date }], default: [] })
  responses: Array<{ authorId: Types.ObjectId; message: string; createdAt: Date }>;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
