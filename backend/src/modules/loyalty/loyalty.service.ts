import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Loyalty, LoyaltyDocument, LoyaltyVoucher } from './loyalty.schema';
import { SettingsService } from '../settings/settings.service';

export const REWARDS = [
  { id: 'free-delivery', title: 'Free Delivery', description: 'Waive the delivery fee on one order', points: 200, category: 'Delivery', discountType: 'free_delivery', discountValue: 0, validDays: 30 },
  { id: 'five-off', title: '5 Off', description: '5 off any order', points: 300, category: 'Discount', discountType: 'flat', discountValue: 5, validDays: 30 },
  { id: 'ten-percent', title: '10% Off', description: '10% off your order subtotal', points: 500, category: 'Discount', discountType: 'percentage', discountValue: 10, validDays: 30 },
  { id: 'fifteen-off', title: '15 Off', description: '15 off any order', points: 800, category: 'Discount', discountType: 'flat', discountValue: 15, validDays: 45 },
  { id: 'quarter-off', title: '25% Off', description: '25% off your order subtotal', points: 1500, category: 'VIP', discountType: 'percentage', discountValue: 25, validDays: 60 },
] as const;

/** Flat rewards are shown in the platform currency ("5 USD Off"). */
const withCurrency = (r: (typeof REWARDS)[number], currency: string) =>
  r.discountType === 'flat'
    ? { ...r, title: `${r.discountValue} ${currency} Off`, description: `${r.discountValue} ${currency} off any order` }
    : r;

export const TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 1000 },
  { name: 'Gold', min: 5000 },
  { name: 'Platinum', min: 15000 },
];

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>,
    private settings: SettingsService,
  ) {}

  private async ensure(userId: string) {
    return this.loyaltyModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { points: 0, lifetimePoints: 0 } },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async getByUser(userId: string) {
    const [loyalty, { currency }] = await Promise.all([this.ensure(userId), this.settings.get()]);
    const obj = loyalty!.toObject();
    const lifetime = Math.max(obj.lifetimePoints || 0, obj.points || 0);
    const tier = [...TIERS].reverse().find((t) => lifetime >= t.min) || TIERS[0];
    const next = TIERS[TIERS.findIndex((t) => t.name === tier.name) + 1] || null;
    return {
      ...obj,
      transactions: [...(obj.transactions || [])].reverse().slice(0, 30),
      vouchers: (obj.vouchers || []).filter((v) => !v.used && new Date(v.expiresAt) > new Date()),
      tier: tier.name,
      nextTier: next ? { name: next.name, pointsNeeded: next.min - lifetime } : null,
      tierProgress: next ? Math.min(100, ((lifetime - tier.min) / (next.min - tier.min)) * 100) : 100,
      rewards: REWARDS.map((r) => withCurrency(r, currency)),
    };
  }

  async addPoints(userId: string, points: number, description: string) {
    if (!(points > 0)) return null;
    await this.ensure(userId);
    return this.loyaltyModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $inc: { points, lifetimePoints: points },
        $push: { transactions: { kind: 'earn', points, description, date: new Date() } },
      },
      { returnDocument: 'after' },
    );
  }

  async redeemReward(userId: string, rewardId: string) {
    const base = REWARDS.find((r) => r.id === rewardId);
    if (!base) throw new NotFoundException('Reward not found');
    const reward = withCurrency(base, (await this.settings.get()).currency);

    const code = `TN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const voucher: LoyaltyVoucher = {
      code,
      title: reward.title,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      expiresAt: new Date(Date.now() + reward.validDays * 86400000),
      used: false,
    };

    const updated = await this.loyaltyModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), points: { $gte: reward.points } },
      {
        $inc: { points: -reward.points },
        $push: {
          transactions: { kind: 'redeem', points: -reward.points, description: `Redeemed ${reward.title}`, date: new Date() },
          vouchers: voucher,
        },
      },
      { returnDocument: 'after' },
    );
    if (!updated) throw new BadRequestException('Not enough points for this reward');
    return { voucher, points: updated.points };
  }

  /** Finds an unused, unexpired voucher owned by the user (read-only; see `claimVoucher`). */
  async findVoucher(userId: string, code: string) {
    const loyalty = await this.loyaltyModel.findOne({ userId: new Types.ObjectId(userId) });
    return loyalty?.vouchers?.find((v) => v.code === code.toUpperCase() && !v.used && v.expiresAt > new Date()) || null;
  }

  /**
   * Marks a voucher used in one conditional write. Returns false if it was already used, expired or
   * not owned — so two simultaneous checkouts can never both spend the same voucher.
   */
  async claimVoucher(userId: string, code: string) {
    const res = await this.loyaltyModel.updateOne(
      {
        userId: new Types.ObjectId(userId),
        vouchers: { $elemMatch: { code: code.toUpperCase(), used: false, expiresAt: { $gt: new Date() } } },
      },
      { $set: { 'vouchers.$.used': true } },
    );
    return res.modifiedCount === 1;
  }

  /** Gives a voucher back (order failed or was cancelled). */
  async restoreVoucher(userId: string, code: string) {
    await this.loyaltyModel.updateOne(
      { userId: new Types.ObjectId(userId), vouchers: { $elemMatch: { code: code.toUpperCase(), used: true } } },
      { $set: { 'vouchers.$.used': false } },
    );
  }
}
