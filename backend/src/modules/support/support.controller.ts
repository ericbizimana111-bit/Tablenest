import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { CreateTicketDto, SupportService, TicketReplyDto } from './support.service';

@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get('my-tickets')
  getMyTickets(@Request() req) {
    return this.supportService.findByUser(req.user._id.toString());
  }

  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.supportService.findVisible(id, req.user);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateTicketDto) {
    return this.supportService.create(req.user._id.toString(), dto);
  }

  @Post(':id/reply')
  reply(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: TicketReplyDto) {
    return this.supportService.reply(id, req.user, dto.message);
  }
}
