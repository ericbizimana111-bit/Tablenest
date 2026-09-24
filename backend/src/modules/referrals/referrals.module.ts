import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { Referral, ReferralSchema } from './referral.schema';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Referral.name, schema: ReferralSchema }]), LoyaltyModule],
    controllers: [ReferralsController],
    providers: [ReferralsService],
    exports: [ReferralsService, MongooseModule],
})
export class ReferralsModule { }