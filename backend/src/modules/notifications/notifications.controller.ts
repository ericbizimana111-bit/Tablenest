import { Controller, Delete, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsIn, IsOptional } from 'class-validator';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './notification.schema';

class NotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['all', ...Object.values(NotificationType)])
  type?: string;
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findByUser(@Request() req, @Query() query: NotificationsQueryDto) {
    return this.notificationsService.findByUser(req.user._id.toString(), query);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user._id.toString());
  }

  @Patch('mark-all-read')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user._id.toString());
  }

  @Patch(':id/read')
  markRead(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.notificationsService.markReadForUser(req.user._id.toString(), id);
  }

  @Delete('clear-all')
  clearAll(@Request() req) {
    return this.notificationsService.clearAll(req.user._id.toString());
  }
}
