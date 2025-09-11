import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorator/public.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.isPublic = this.isPublic(context);

    return super.canActivate(context);
  }

  // Description:
  // 1. private api:
  // - no token => return 401
  // - token error => return 401
  // - token success => return user
  // 2. public + private used together: have decorator @Public()
  // - no token => return errorUser
  // - token error => return errorUser
  // - token success => return user
  // **errorUser = {
  //   userId: null,
  //   scope: { role: null, permissions: [] },
  // }
  handleRequest(err: any, user: any, info: any, context: any) {
    const isPublic = context?.args?.[0]?.isPublic ?? false;

    if (isPublic) {
      if (err || !user) {
        return {
          userId: null,
          scope: { role: null, permissions: [] },
        } as CurrentUserDto;
      }
      return user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
