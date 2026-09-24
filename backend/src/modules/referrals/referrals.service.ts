import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Referral, ReferralDocument } from './referral.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../../common/services/mail.service';
import { escapeHtml } from '../auth/auth.service';

export const REFERRAL_REWARD = 500;
const MAX_INVITES_PER_DAY = 20;

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private loyalty: LoyaltyService,
    private mail: MailService,
  ) {}

  /** The user's referral profile, created on first use. */
  async getByUser(userId: string, fullName = '') {
    const existing = await this.referralModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existing) return existing;
    const prefix = fullName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
    try {
      return await this.referralModel.create({ userId, code: `NEST-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}` });
    } catch {
      return this.referralModel.findOne({ userId: new Types.ObjectId(userId) });
    }
  }

  async invite(userId: string, email: string, inviterName: string) {
    const ref = await this.getByUser(userId, inviterName);
    if (!ref) throw new BadRequestException('Referral profile not found');
    if (ref.referrals.some((r) => r.email === email)) throw new ConflictException('You already invited this email');
    const since = Date.now() - 86400000;
    if (ref.referrals.filter((r) => r.invitedAt && r.invitedAt.getTime() > since).length >= MAX_INVITES_PER_DAY) {
      throw new HttpException(`You can send at most ${MAX_INVITES_PER_DAY} invitations per day`, HttpStatus.TOO_MANY_REQUESTS);
    }

    ref.referrals.push({ email, name: email.split('@')[0], status: 'pending', reward: 0, invitedAt: new Date() } as Referral['referrals'][number]);
    await ref.save();
    const name = escapeHtml(inviterName);
    await this.mail.send(
      email,
      `${inviterName.replace(/[\r\n]/g, ' ').slice(0, 60)} invited you to TableNest`,
      `<p>${name} thinks you'll love TableNest. Sign up with code <b>${ref.code}</b> and you both earn ${REFERRAL_REWARD} reward points after your first order.</p>`,
    );
    return ref;
  }

  /** Called when a customer completes their first order/booking. Pays out both sides once. */
  async completeForUser(referredUserId: string) {
    const match = { referrals: { $elemMatch: { referredUserId: new Types.ObjectId(referredUserId), status: 'pending' } } };
    const updated = await this.referralModel.findOneAndUpdate(match, {
      $set: { 'referrals.$.status': 'successful', 'referrals.$.reward': REFERRAL_REWARD },
      $inc: { totalEarned: REFERRAL_REWARD },
    });
    if (!updated) return;
    await this.loyalty.addPoints(updated.userId.toString(), REFERRAL_REWARD, 'Referral reward');
    await this.loyalty.addPoints(referredUserId, REFERRAL_REWARD, 'Referral welcome reward');
  }
}
