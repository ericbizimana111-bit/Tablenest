import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referral, ReferralDocument } from './referral.schema';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../../common/services/mail.service';

export const REFERRAL_REWARD = 500;

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private loyalty: LoyaltyService,
    private mail: MailService,
  ) {}

  getByUser(userId: string) {
    return this.referralModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async invite(userId: string, email: string, inviterName: string) {
    const ref = await this.getByUser(userId);
    if (!ref) throw new BadRequestException('Referral profile not found');
    if (ref.referrals.some((r) => r.email === email)) throw new BadRequestException('You already invited this email');

    ref.referrals.push({ email, name: email.split('@')[0], status: 'pending', reward: 0, invitedAt: new Date() } as any);
    await ref.save();
    await this.mail.send(
      email,
      `${inviterName} invited you to TableNest`,
      `<p>${inviterName} thinks you'll love TableNest. Sign up with code <b>${ref.code}</b> and you both earn ${REFERRAL_REWARD} reward points after your first order.</p>`,
    );
    return ref;
  }

  /** Called when a customer completes their first order/booking. Pays out both sides once. */
  async completeForUser(referredUserId: string) {
    const ref = await this.referralModel.findOne({
      referrals: { $elemMatch: { referredUserId: new Types.ObjectId(referredUserId), status: 'pending' } },
    });
    if (!ref) return;
    const updated = await this.referralModel.findOneAndUpdate(
      { _id: ref._id, referrals: { $elemMatch: { referredUserId: new Types.ObjectId(referredUserId), status: 'pending' } } },
      { $set: { 'referrals.$.status': 'successful', 'referrals.$.reward': REFERRAL_REWARD }, $inc: { totalEarned: REFERRAL_REWARD } },
    );
    if (!updated) return;
    await this.loyalty.addPoints(ref.userId.toString(), REFERRAL_REWARD, 'Referral reward');
    await this.loyalty.addPoints(referredUserId, REFERRAL_REWARD, 'Referral welcome reward');
  }
}
