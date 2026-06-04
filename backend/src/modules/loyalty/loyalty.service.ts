import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loyalty, LoyaltyDocument } from './loyalty.schema';

@Injectable()
export class LoyaltyService {
    constructor(@InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>) { }

    async getByUser(userId: string) {
        return this.loyaltyModel.findOne({ userId });
    }

    async addPoints(userId: string, points: number, description: string) {
        return this.loyaltyModel.findOneAndUpdate(
            { userId },
            { $inc: { points }, $push: { transactions: { type: 'earn', points, description, date: new Date() } } },
            { new: true, upsert: true },
        );
    }

    async redeemPoints(userId: string, points: number, description: string) {
        return this.loyaltyModel.findOneAndUpdate(
            { userId },
            { $inc: { points: -points }, $push: { transactions: { type: 'redeem', points: -points, description, date: new Date() } } },
            { new: true },
        );
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / loyalty / loyalty.controller.ts << 'EOF'
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
@UseGuards(AuthGuard('jwt'))
export class LoyaltyController {
    constructor(private loyaltyService: LoyaltyService) { }

    @Get()
    getMyLoyalty(@Request() req) { return this.loyaltyService.getByUser(req.user._id.toString()); }

    @Post('add')
    addPoints(@Request() req, @Body() body: { points: number; description: string }) {
        return this.loyaltyService.addPoints(req.user._id.toString(), body.points, body.description);
    }

    @Post('redeem')
    redeemPoints(@Request() req, @Body() body: { points: number; description: string }) {
        return this.loyaltyService.redeemPoints(req.user._id.toString(), body.points, body.description);
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / loyalty / loyalty.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { Loyalty, LoyaltySchema } from './loyalty.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Loyalty.name, schema: LoyaltySchema }])],
    controllers: [LoyaltyController],
    providers: [LoyaltyService],
    exports: [LoyaltyService, MongooseModule],
})
export class LoyaltyModule { }
EOF

# Referrals module
cat > /home/claude / tablenest / backend / src / modules / referrals / referrals.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Referral, ReferralDocument } from './referral.schema';

@Injectable()
export class ReferralsService {
    constructor(@InjectModel(Referral.name) private referralModel: Model<ReferralDocument>) { }

    async getByUser(userId: string) {
        return this.referralModel.findOne({ userId });
    }

    async trackReferral(code: string, referredUser: any) {
        return this.referralModel.findOneAndUpdate(
            { code },
            { $push: { referrals: { ...referredUser, status: 'pending', invitedAt: new Date() } } },
            { new: true },
        );
    }

    async completeReferral(code: string, referredUserId: string) {
        return this.referralModel.findOneAndUpdate(
            { code, 'referrals.referredUserId': referredUserId },
            { $set: { 'referrals.$.status': 'successful', 'referrals.$.reward': 500 }, $inc: { totalEarned: 500 } },
            { new: true },
        );
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / referrals / referrals.controller.ts << 'EOF'
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
EOF

cat > /home/claude / tablenest / backend / src / modules / referrals / referrals.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { Referral, ReferralSchema } from './referral.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Referral.name, schema: ReferralSchema }])],
    controllers: [ReferralsController],
    providers: [ReferralsService],
    exports: [ReferralsService, MongooseModule],
})
export class ReferralsModule { }