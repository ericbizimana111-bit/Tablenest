import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ChangePasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const SIGNUP_BONUS = 100;
const BCRYPT_ROUNDS = 12;
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;
/** Compared against when the email is unknown so response time does not reveal which emails exist. */
const DUMMY_HASH = bcrypt.hashSync('tablenest-timing-equaliser', BCRYPT_ROUNDS);

export type JwtPayload = { sub: string; role: UserRole; tv: number };

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mail: MailService,
  ) {}

  private async createAccount(dto: RegisterDto, role: UserRole.CUSTOMER | UserRole.OWNER) {
    if (await this.userModel.exists({ email: dto.email })) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      phone: dto.phone ?? null,
      role,
    });

    const prefix = user.fullName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
    const code = `NEST-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await this.referralModel.create({ userId: user._id, code });

    const bonus = role === UserRole.CUSTOMER ? SIGNUP_BONUS : 0;
    await this.loyaltyModel.create({
      userId: user._id,
      points: bonus,
      lifetimePoints: bonus,
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
    this.logger.log(`auth.register role=${role} uid=${user._id.toString()}`);
    return user;
  }

  async register(dto: RegisterDto) {
    const user = await this.createAccount(dto, UserRole.CUSTOMER);
    return { user: user.toJSON(), accessToken: this.sign(user, 0) };
  }

  async registerOwner(dto: RegisterDto) {
    const user = await this.createAccount(dto, UserRole.OWNER);
    return { user: user.toJSON(), accessToken: this.sign(user, 0) };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password +failedLoginAttempts +lockUntil +tokenVersion');

    if (!user) {
      await bcrypt.compare(dto.password, DUMMY_HASH);
      this.logger.warn('auth.login_failed reason=unknown_email');
      throw new UnauthorizedException('Incorrect email or password');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      this.logger.warn(`auth.login_blocked reason=locked uid=${user._id.toString()}`);
      throw new HttpException(
        `Too many failed sign-in attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const lock = attempts >= MAX_FAILED_LOGINS;
      await this.userModel.updateOne(
        { _id: user._id },
        lock
          ? { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60000) }
          : { failedLoginAttempts: attempts },
      );
      this.logger.warn(`auth.login_failed reason=bad_password uid=${user._id.toString()} attempts=${attempts}${lock ? ' locked=true' : ''}`);
      throw new UnauthorizedException('Incorrect email or password');
    }

    if (!user.isActive) {
      this.logger.warn(`auth.login_failed reason=inactive uid=${user._id.toString()}`);
      throw new UnauthorizedException('This account has been deactivated');
    }

    await this.userModel.updateOne({ _id: user._id }, { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() });
    return { user: user.toJSON(), accessToken: this.sign(user, user.tokenVersion || 0) };
  }

  async forgotPassword(email: string) {
    const response: Record<string, unknown> = {
      message: 'If an account exists for that email, a reset link has been sent.',
    };
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) return response;

    const token = crypto.randomBytes(32).toString('hex');
    await this.userModel.updateOne(
      { _id: user._id },
      { resetPasswordToken: sha256(token), resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) },
    );

    const base = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${base}/reset-password?token=${token}`;
    await this.mail.send(
      user.email,
      'Reset your TableNest password',
      `<p>Hi ${escapeHtml(user.fullName)},</p><p>Use the link below to choose a new password. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    );

    // Without SMTP (local development only) surface the link so the flow stays testable.
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

    await this.userModel.updateOne(
      { _id: user._id },
      {
        password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        failedLoginAttempts: 0,
        lockUntil: null,
        $inc: { tokenVersion: 1 },
      },
    );
    this.logger.log(`auth.password_reset uid=${user._id.toString()}`);
    return { message: 'Password reset successfully' };
  }

  /** Changes the password, revokes all other sessions and returns a fresh token for this one. */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');

    if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Choose a password different from your current one');
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS), $inc: { tokenVersion: 1 } },
        { returnDocument: 'after' },
      )
      .select('+tokenVersion');
    this.logger.log(`auth.password_changed uid=${userId}`);
    return { message: 'Password updated successfully', accessToken: this.sign(updated!, updated!.tokenVersion) };
  }

  async logoutAll(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
    return { message: 'Signed out of all devices' };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private sign(user: UserDocument, tokenVersion: number) {
    const payload: JwtPayload = { sub: user._id.toString(), role: user.role, tv: tokenVersion };
    return this.jwtService.sign(payload);
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
