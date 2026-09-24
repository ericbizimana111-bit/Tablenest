import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { ReferralsService } from './referrals.service';

class InviteDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;
}

@Controller('referrals')
@UseGuards(AuthGuard('jwt'))
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  getMyReferrals(@Request() req) {
    return this.referralsService.getByUser(req.user._id.toString());
  }

  @Post('invite')
  invite(@Request() req, @Body() body: InviteDto) {
    return this.referralsService.invite(req.user._id.toString(), body.email, req.user.fullName);
  }
}
