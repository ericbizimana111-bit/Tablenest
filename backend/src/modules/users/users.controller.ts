import { Controller, Get, Put, Patch, Delete, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './user.schema';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  getStats() {
    return this.usersService.getStats();
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user._id.toString(), data);
  }

  @Patch('notification-prefs')
  updateNotificationPrefs(@Request() req, @Body() prefs: any) {
    return this.usersService.updateNotificationPrefs(req.user._id.toString(), prefs);
  }

  @Delete('account')
  deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user._id.toString());
  }

  @Get('favorites')
  @Roles(UserRole.CUSTOMER)
  getFavorites(@Request() req) {
    return this.usersService.getFavorites(req.user._id.toString());
  }

  @Post('favorites/:restaurantId')
  @Roles(UserRole.CUSTOMER)
  addFavorite(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.usersService.addFavorite(req.user._id.toString(), restaurantId);
  }

  @Delete('favorites/:restaurantId')
  @Roles(UserRole.CUSTOMER)
  removeFavorite(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.usersService.removeFavorite(req.user._id.toString(), restaurantId);
  }

  @Get('addresses')
  getAddresses(@Request() req) {
    return this.usersService.getAddresses(req.user._id.toString());
  }

  @Post('addresses')
  addAddress(@Request() req, @Body() body: any) {
    return this.usersService.addAddress(req.user._id.toString(), body);
  }

  @Put('addresses/:index')
  updateAddress(@Request() req, @Param('index') index: string, @Body() body: any) {
    return this.usersService.updateAddress(req.user._id.toString(), +index, body);
  }

  @Delete('addresses/:index')
  deleteAddress(@Request() req, @Param('index') index: string) {
    return this.usersService.deleteAddress(req.user._id.toString(), +index);
  }

  @Get('payment-methods')
  getPaymentMethods(@Request() req) {
    return this.usersService.getPaymentMethods(req.user._id.toString());
  }

  @Post('payment-methods')
  addPaymentMethod(@Request() req, @Body() body: any) {
    return this.usersService.addPaymentMethod(req.user._id.toString(), body);
  }

  @Delete('payment-methods/:index')
  deletePaymentMethod(@Request() req, @Param('index') index: string) {
    return this.usersService.deletePaymentMethod(req.user._id.toString(), +index);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  suspend(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.suspend(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  activate(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.activate(id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  findById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.usersService.findById(id);
  }
}
