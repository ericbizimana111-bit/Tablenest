import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString } from 'class-validator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { LoyaltyService } from './loyalty.service';

class RedeemDto {
  @IsString()
  rewardId: string;
}

@Controller('loyalty')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get()
  getMyLoyalty(@Request() req) {
    return this.loyaltyService.getByUser(req.user._id.toString());
  }

  @Post('redeem')
  @Roles(UserRole.CUSTOMER)
  redeem(@Request() req, @Body() body: RedeemDto) {
    return this.loyaltyService.redeemReward(req.user._id.toString(), body.rewardId);
  }
}
