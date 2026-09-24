import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { Loyalty, LoyaltyDocument } from '../loyalty/loyalty.schema';
import { Referral, ReferralDocument } from '../referrals/referral.schema';
import { MailService } from '../../common/services/mail.service';
import { ChangePasswordDto, LoginDto, RegisterDto, RegisterOwnerDto, ResetPasswordDto } from './auth.dto';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const SIGNUP_BONUS = 100;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mail: MailService,
  ) {}

  private async createAccount(dto: RegisterDto, role: UserRole) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('An account with this email already exists');

    const user = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 12),
      phone: dto.phone,
      role,
      activePlan: role === UserRole.OWNER ? 'Business' : 'Gourmet Pro',
    });

    const prefix = user.fullName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
    const code = `NEST-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await this.referralModel.create({ userId: user._id, code });

    const bonus = role === UserRole.CUSTOMER ? SIGNUP_BONUS : 0;
    await this.loyaltyModel.create({
      userId: user._id,
      points: bonus,
      transactions: bonus ? [{ kind: 'earn', points: bonus, description: 'Welcome bonus', date: new Date() }] : [],
    });

    if (role === UserRole.CUSTOMER && dto.referralCode) {
      await this.referralModel.findOneAndUpdate(
        { code: dto.referralCode.toUpperCase(), userId: { $ne: user._id } },
        {
          $push: {
            referrals: {
              referredUserId: user._id,
              email: user.email,
              name: user.fullName,
              status: 'pending',
              reward: 0,
              invitedAt: new Date(),
            },
          },
        },
      );
    }
    return user;
  }

  async register(dto: RegisterDto) {
    const user = await this.createAccount(dto, UserRole.CUSTOMER);
    return { user: this.sanitize(user), ...this.generateTokens(user) };
  }

  async registerOwner(dto: RegisterOwnerDto) {
    const user = await this.createAccount(dto, UserRole.OWNER);
    return { user: this.sanitize(user), ...this.generateTokens(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Incorrect email or password');
    if (!user.isActive) throw new UnauthorizedException('This account has been deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Incorrect email or password');

    return { user: this.sanitize(user), ...this.generateTokens(user) };
  }

  async forgotPassword(email: string) {
    const response: Record<string, unknown> = {
      message: 'If an account exists for that email, a reset link has been sent.',
    };
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) return response;

    const token = crypto.randomBytes(32).toString('hex');
    await this.userModel.findByIdAndUpdate(user._id, {
      resetPasswordToken: sha256(token),
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const base = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${base}/reset-password?token=${token}`;
    await this.mail.send(
      user.email,
      'Reset your TableNest password',
      `<p>Hi ${user.fullName},</p><p>Use the link below to choose a new password. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    );

    // Without SMTP configured (local development) surface the link so the flow stays testable.
    if (!this.mail.isConfigured && this.configService.get('NODE_ENV') !== 'production') {
      response.devResetUrl = `/reset-password?token=${token}`;
    }
    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: sha256(dto.token),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException('This reset link is invalid or has expired');

    await this.userModel.findByIdAndUpdate(user._id, {
      password: await bcrypt.hash(dto.password, 12),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    await this.userModel.findByIdAndUpdate(userId, { password: await bcrypt.hash(dto.newPassword, 12) });
    return { message: 'Password updated successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  private sanitize(user: UserDocument) {
    const obj = user.toObject() as Record<string, unknown>;
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  }
}
