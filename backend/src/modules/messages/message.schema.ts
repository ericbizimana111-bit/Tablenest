import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;
export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: [] })
  attachments: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  participants: Types.ObjectId[];

  @Prop({ default: null })
  lastMessage: string;

  @Prop({ default: null })
  lastMessageAt: Date;

  @Prop({ default: null })
  restaurantId: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
