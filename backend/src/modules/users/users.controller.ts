import { Controller, Get, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  findById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user._id.toString(), data);
  }

  @Patch('notification-prefs')
  updateNotificationPrefs(@Request() req, @Body() prefs: any) {
    return this.usersService.updateNotificationPrefs(req.user._id.toString(), prefs);
  }

  @Patch(':id/suspend')
  suspend(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.suspend(id);
  }

  @Patch(':id/activate')
  activate(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.activate(id);
  }

  @Delete('account')
  deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user._id.toString());
  }
}
