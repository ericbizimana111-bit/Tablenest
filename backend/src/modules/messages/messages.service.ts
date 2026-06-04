import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument, Conversation, ConversationDocument } from './message.schema';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    ) { }

    async getConversations(userId: string) {
        return this.conversationModel.find({ participants: userId }).sort({ lastMessageAt: -1 });
    }

    async getMessages(conversationId: string) {
        return this.messageModel.find({ conversationId }).sort({ createdAt: 1 });
    }

    async sendMessage(senderId: string, conversationId: string, content: string) {
        const message = await this.messageModel.create({ conversationId, senderId, content });
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: content,
            lastMessageAt: new Date(),
        });
        return message;
    }

    async createConversation(participants: string[], restaurantId?: string) {
        return this.conversationModel.create({ participants, restaurantId, lastMessageAt: new Date() });
    }
}