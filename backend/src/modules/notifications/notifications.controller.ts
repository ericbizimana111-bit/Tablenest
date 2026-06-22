import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
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

  @Patch(':id/read')
  markRead(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.notificationsService.markReadForUser(req.user._id.toString(), id);
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
