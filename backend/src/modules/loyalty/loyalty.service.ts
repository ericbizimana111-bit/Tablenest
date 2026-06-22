import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loyalty, LoyaltyDocument } from './loyalty.schema';

@Injectable()
export class LoyaltyService {
  constructor(@InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>) {}

  async getByUser(userId: string) {
    return this.loyaltyModel.findOne({ userId });
  }

  async addPoints(userId: string, points: number, description: string) {
    if (points <= 0) throw new BadRequestException('Points must be positive');
    return this.loyaltyModel.findOneAndUpdate(
      { userId },
      { $inc: { points }, $push: { transactions: { type: 'earn', points, description, date: new Date() } } },
      { returnDocument: 'after', upsert: true },
    );
  }

  async redeemPoints(userId: string, points: number, description: string) {
    if (points <= 0) throw new BadRequestException('Points must be positive');

    const loyalty = await this.loyaltyModel.findOne({ userId });
    if (!loyalty || loyalty.points < points) {
      throw new BadRequestException('Insufficient points');
    }

    return this.loyaltyModel.findOneAndUpdate(
      { userId, points: { $gte: points } },
      { $inc: { points: -points }, $push: { transactions: { type: 'redeem', points: -points, description, date: new Date() } } },
      { returnDocument: 'after' },
    );
  }
}
