import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket, SupportTicketDocument, TicketStatus } from './support.schema';

@Injectable()
export class SupportService {
    constructor(@InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>) { }

    async create(userId: string, data: any) {
        return this.ticketModel.create({ ...data, userId });
    }

    async findAll(query: any = {}) {
        const { page = 1, limit = 20, status, type, priority, search } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (search) filter.$or = [
            { subject: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            this.ticketModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
            this.ticketModel.countDocuments(filter),
        ]);
        return { tickets, total, page: +page, pages: Math.ceil(total / limit) };
    }

    async findById(id: string) {
        const ticket = await this.ticketModel.findById(id);
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async findByIdForUser(id: string, user: { _id: { toString(): string }; role: string }) {
        const ticket = await this.findById(id);
        if (ticket.userId.toString() !== user._id.toString()) {
            throw new ForbiddenException('Access denied');
        }
        return ticket;
    }

    async findByUser(userId: string) {
        return this.ticketModel.find({ userId }).sort({ createdAt: -1 });
    }

    async updateStatus(id: string, status: TicketStatus) {
        return this.ticketModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    }

    async addResponse(id: string, authorId: string, message: string) {
        return this.ticketModel.findByIdAndUpdate(
            id,
            { $push: { responses: { authorId, message, createdAt: new Date() } } },
            { returnDocument: 'after' },
        );
    }

    async getStats() {
        const [total, open, inProgress, resolved] = await Promise.all([
            this.ticketModel.countDocuments(),
            this.ticketModel.countDocuments({ status: TicketStatus.OPEN }),
            this.ticketModel.countDocuments({ status: TicketStatus.IN_PROGRESS }),
            this.ticketModel.countDocuments({ status: TicketStatus.RESOLVED }),
        ]);
        return { total, open, inProgress, resolved, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
    }
}
