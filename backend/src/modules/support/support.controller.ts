import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { SupportService } from './support.service';
import { TicketStatus } from './support.schema';

@Controller('support')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll(@Query() query: any) {
    return this.supportService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  getStats() {
    return this.supportService.getStats();
  }

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

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(@Param('id', MongoIdValidationPipe) id: string, @Body() body: { status: TicketStatus }) {
    return this.supportService.updateStatus(id, body.status);
  }

  @Post(':id/respond')
  @Roles(UserRole.SUPER_ADMIN)
  addResponse(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() body: { message: string }) {
    return this.supportService.addResponse(id, req.user._id.toString(), body.message);
  }
}
