import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { SupportService } from './support.service';

@Controller('support')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get('my-tickets')
  getMyTickets(@Request() req) {
    return this.supportService.findByUser(req.user._id.toString());
  }

  @Get(':id')
  findById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.supportService.findByIdForUser(id, req.user);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.supportService.create(req.user._id.toString(), data);
  }
}
