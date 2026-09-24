import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SupportTicket, SupportTicketDocument, TicketPriority, TicketStatus, TicketType } from './support.schema';
import { Trim } from '../../common/validation/validators';
import { escapeRegex } from '../../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { UserRole } from '../users/user.schema';
import type { Actor } from '../../common/services/access-control.service';

export class CreateTicketDto {
  @Trim()
  @IsString()
  @MinLength(3, { message: 'Subject is required' })
  @MaxLength(150)
  subject: string;

  @Trim()
  @IsString()
  @MinLength(5, { message: 'Please describe the problem' })
  @MaxLength(3000)
  description: string;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;
}

export class TicketReplyDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  message: string;
}

export class TicketUpdateDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}

const MAX_OPEN_TICKETS = 10;

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>,
    private notifications: NotificationsService,
  ) {}

  /** Only subject, description and type come from the user; status, priority and assignment are staff-controlled. */
  async create(userId: string, dto: CreateTicketDto) {
    const open = await this.ticketModel.countDocuments({ userId, status: { $in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } });
    if (open >= MAX_OPEN_TICKETS) throw new BadRequestException('You have too many open tickets. We will get back to you soon.');
    return this.ticketModel.create({ userId: new Types.ObjectId(userId), subject: dto.subject, description: dto.description, type: dto.type || TicketType.OTHER });
  }

  findByUser(userId: string) {
    return this.ticketModel.find({ userId }).sort({ createdAt: -1 }).limit(100);
  }

  /** The ticket's author or an admin; anyone else gets 404 so ids cannot be probed. */
  async findVisible(id: string, user: Actor) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket || (user.role !== UserRole.ADMIN && ticket.userId.toString() !== user._id.toString())) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async reply(id: string, user: Actor, message: string) {
    const ticket = await this.findVisible(id, user);
    const isStaff = user.role === UserRole.ADMIN;
    const update: Record<string, unknown> = { $push: { responses: { authorId: user._id, message, createdAt: new Date() } } };
    if (isStaff && ticket.status === TicketStatus.OPEN) update.status = TicketStatus.IN_PROGRESS;
    if (!isStaff && ticket.status === TicketStatus.RESOLVED) update.status = TicketStatus.OPEN;
    const updated = await this.ticketModel.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    if (isStaff) {
      this.notifications
        .create(ticket.userId.toString(), { title: 'Support replied', message: message.slice(0, 120), type: NotificationType.SYSTEM, link: '/notifications' })
        .catch(() => undefined);
    }
    return updated;
  }

  async adminUpdate(id: string, dto: TicketUpdateDto) {
    const updated = await this.ticketModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' });
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }

  async list(query: { status?: TicketStatus; type?: TicketType; search?: string }, page: number, limit: number) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.search) {
      const rx = { $regex: escapeRegex(query.search), $options: 'i' };
      filter.$or = [{ subject: rx }, { description: rx }];
    }
    const [tickets, total] = await Promise.all([
      this.ticketModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.ticketModel.countDocuments(filter),
    ]);
    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }
}
