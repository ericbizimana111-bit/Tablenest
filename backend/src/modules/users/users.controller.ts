import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './user.schema';
import { UsersService } from './users.service';
import { AddressDto, NotificationPrefsDto, PaymentMethodDto, UpdateAddressDto, UpdateProfileDto } from './users.dto';

/** Everything here acts on the signed-in user only; no endpoint accepts a user id. */
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user, dto);
  }

  @Patch('notification-prefs')
  updateNotificationPrefs(@Request() req, @Body() dto: NotificationPrefsDto) {
    return this.usersService.updateNotificationPrefs(req.user._id.toString(), dto);
  }

  @Delete('account')
  deleteAccount(@Request() req) {
    return this.usersService.deactivate(req.user._id.toString());
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
  addAddress(@Request() req, @Body() dto: AddressDto) {
    return this.usersService.addAddress(req.user._id.toString(), dto);
  }

  @Put('addresses/:index')
  updateAddress(@Request() req, @Param('index', ParseIntPipe) index: number, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(req.user._id.toString(), index, dto);
  }

  @Delete('addresses/:index')
  deleteAddress(@Request() req, @Param('index', ParseIntPipe) index: number) {
    return this.usersService.deleteAddress(req.user._id.toString(), index);
  }

  @Patch('addresses/:index/default')
  setDefaultAddress(@Request() req, @Param('index', ParseIntPipe) index: number) {
    return this.usersService.setDefaultAddress(req.user._id.toString(), index);
  }

  @Get('payment-methods')
  getPaymentMethods(@Request() req) {
    return this.usersService.getPaymentMethods(req.user._id.toString());
  }

  @Post('payment-methods')
  addPaymentMethod(@Request() req, @Body() dto: PaymentMethodDto) {
    return this.usersService.addPaymentMethod(req.user._id.toString(), dto);
  }

  @Delete('payment-methods/:index')
  deletePaymentMethod(@Request() req, @Param('index', ParseIntPipe) index: number) {
    return this.usersService.deletePaymentMethod(req.user._id.toString(), index);
  }

  @Patch('payment-methods/:index/default')
  setDefaultPaymentMethod(@Request() req, @Param('index', ParseIntPipe) index: number) {
    return this.usersService.setDefaultPaymentMethod(req.user._id.toString(), index);
  }
}
