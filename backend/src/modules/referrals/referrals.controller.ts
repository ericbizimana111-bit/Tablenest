import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(AuthGuard('jwt'))
export class ReferralsController {
    constructor(private referralsService: ReferralsService) { }

    @Get()
    getMyReferrals(@Request() req) { return this.referralsService.getByUser(req.user._id.toString()); }

    @Post('track/:code')
    trackReferral(@Param('code') code: string, @Body() body: any) {
        return this.referralsService.trackReferral(code, body);
    }
}