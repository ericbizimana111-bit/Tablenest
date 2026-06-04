import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { Loyalty, LoyaltyDocument } from '../loyalty/loyalty.schema';
import { Referral, ReferralDocument } from '../referrals/referral.schema';
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Loyalty.name) private loyaltyModel: Model<LoyaltyDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      ...dto,
      password: hashed,
      role: dto.role || UserRole.CUSTOMER,
    });

    // Create loyalty account
    await this.loyaltyModel.create({ userId: user._id, points: 0 });

    // Create referral code
    const code = 'NEST-' + user.fullName.toUpperCase().slice(0, 4) + '-' + Date.now().toString(36).toUpperCase();
    await this.referralModel.create({ userId: user._id, code });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account suspended');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('No account with that email');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await this.userModel.findByIdAndUpdate(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    return { message: 'Password reset link sent', token }; // In prod: send email
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.userModel.findByIdAndUpdate(userId, { password: hashed });
    return { message: 'Password updated successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const secret = this.configService.get<string>('JWT_SECRET', 'tablenest_secret_key_2024');
    const accessToken = this.jwtService.sign(payload, { secret, expiresIn: '7d' });
    return { accessToken };
  }

  private sanitize(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }
}
