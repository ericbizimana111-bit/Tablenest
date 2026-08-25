import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referral, ReferralDocument } from './referral.schema';

@Injectable()
export class ReferralsService {
    constructor(@InjectModel(Referral.name) private referralModel: Model<ReferralDocument>) { }

    async getByUser(userId: string) {
        return this.referralModel.findOne({ userId: new Types.ObjectId(userId) });
    }

    async trackReferral(code: string, referredUser: any) {
        return this.referralModel.findOneAndUpdate(
            { code },
            { $push: { referrals: { ...referredUser, status: 'pending', invitedAt: new Date() } } },
            { returnDocument: 'after' },
        );
    }

    async completeReferral(code: string, referredUserId: string) {
        return this.referralModel.findOneAndUpdate(
            { code, 'referrals.referredUserId': referredUserId },
            { $set: { 'referrals.$.status': 'successful', 'referrals.$.reward': 500 }, $inc: { totalEarned: 500 } },
            { returnDocument: 'after' },
        );
    }
}