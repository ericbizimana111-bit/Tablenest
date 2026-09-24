import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import type { JwtPayload } from './auth.service';

/**
 * Resolves the bearer token to the *current* user record. A token is rejected when the user
 * no longer exists, was deactivated, or its version was bumped (password change/reset, logout-all).
 * The role always comes from the database, never from the token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub || !/^[0-9a-f]{24}$/i.test(payload.sub)) throw new UnauthorizedException('Invalid token');
    const user = await this.userModel.findById(payload.sub).select('+tokenVersion');
    if (!user || !user.isActive || (user.tokenVersion || 0) !== (payload.tv || 0)) {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }
    return user;
  }
}
