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
            { returnDocument: 'after', upsert: true },
        );
    }

    async redeemPoints(userId: string, points: number, description: string) {
        return this.loyaltyModel.findOneAndUpdate(
            { userId },
            { $inc: { points: -points }, $push: { transactions: { type: 'redeem', points: -points, description, date: new Date() } } },
            { returnDocument: 'after' },
        );
    }
}





