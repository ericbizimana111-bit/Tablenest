import { Injectable, NotFoundException } from '@nestjs/common';
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

    async findByUser(userId: string) {
        return this.ticketModel.find({ userId }).sort({ createdAt: -1 });
    }

    async updateStatus(id: string, status: TicketStatus) {
        return this.ticketModel.findByIdAndUpdate(id, { status }, { new: true });
    }

    async addResponse(id: string, authorId: string, message: string) {
        return this.ticketModel.findByIdAndUpdate(
            id,
            { $push: { responses: { authorId, message, createdAt: new Date() } } },
            { new: true },
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
EOF

cat > /home/claude / tablenest / backend / src / modules / support / support.controller.ts << 'EOF'
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';
import { TicketStatus } from './support.schema';

@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
    constructor(private supportService: SupportService) { }

    @Get()
    findAll(@Query() query: any) { return this.supportService.findAll(query); }

    @Get('stats')
    getStats() { return this.supportService.getStats(); }

    @Get('my-tickets')
    getMyTickets(@Request() req) { return this.supportService.findByUser(req.user._id.toString()); }

    @Get(':id')
    findById(@Param('id') id: string) { return this.supportService.findById(id); }

    @Post()
    create(@Request() req, @Body() data: any) { return this.supportService.create(req.user._id.toString(), data); }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: TicketStatus }) {
        return this.supportService.updateStatus(id, body.status);
    }

    @Post(':id/respond')
    addResponse(@Request() req, @Param('id') id: string, @Body() body: { message: string }) {
        return this.supportService.addResponse(id, req.user._id.toString(), body.message);
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / support / support.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportTicket, SupportTicketSchema } from './support.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: SupportTicket.name, schema: SupportTicketSchema }])],
    controllers: [SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }