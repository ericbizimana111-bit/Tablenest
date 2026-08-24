import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get()
  getMyLoyalty(@Request() req) {
    return this.loyaltyService.getByUser(req.user._id.toString());
  }

  @Post('add')
  @Roles(UserRole.CUSTOMER)
  addPoints(@Request() req, @Body() body: { points: number; description: string }) {
    return this.loyaltyService.addPoints(req.user._id.toString(), body.points, body.description);
  }

  @Post('redeem')
  @Roles(UserRole.CUSTOMER)
  redeemPoints(@Request() req, @Body() body: { points: number; description: string }) {
    return this.loyaltyService.redeemPoints(req.user._id.toString(), body.points, body.description);
  }
}
