import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findByUser(@Request() req, @Query() query: any) {
    return this.notificationsService.findByUser(req.user._id.toString(), query);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user._id.toString());
  }

  @Post()
  create(@Body() body: any) {
    return this.notificationsService.create(body.userId, body);
  }

  @Patch(':id/read')
  markRead(@Param('id', MongoIdValidationPipe) id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('mark-all-read')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user._id.toString());
  }

  @Delete('clear-all')
  clearAll(@Request() req) {
    return this.notificationsService.clearAll(req.user._id.toString());
  }
}
