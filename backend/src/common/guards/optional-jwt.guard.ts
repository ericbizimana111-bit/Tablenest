import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * For public endpoints that show more to a signed-in manager (e.g. unavailable dishes to their
 * owner). A valid token populates `req.user`; a missing or invalid one leaves the request anonymous.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.headers?.authorization) return true;
    return super.canActivate(context);
  }

  handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return (user || undefined) as TUser;
  }
}
