import { ForbiddenException, Injectable } from '@nestjs/common';
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

    private async assertParticipant(userId: string, conversationId: string) {
        const convo = await this.conversationModel.findOne({ _id: conversationId, participants: userId });
        if (!convo) throw new ForbiddenException('Not a participant in this conversation');
    }

    async getMessages(userId: string, conversationId: string) {
        await this.assertParticipant(userId, conversationId);
        return this.messageModel.find({ conversationId }).sort({ createdAt: 1 });
    }

    async sendMessage(senderId: string, conversationId: string, content: string) {
        await this.assertParticipant(senderId, conversationId);
        const message = await this.messageModel.create({ conversationId, senderId, content });
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: content,
            lastMessageAt: new Date(),
        });
        return message;
    }

    async createConversation(userId: string, participants: string[], restaurantId?: string) {
        const all = [...new Set([userId, ...(participants || [])])];
        return this.conversationModel.create({ participants: all, restaurantId, lastMessageAt: new Date() });
    }
}