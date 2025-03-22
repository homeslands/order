import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
import { IS_PUBLIC_KEY } from 'src/auth/decorator/public.decorator';
import * as _ from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (_.isEmpty(requiredRoles)) return true;

    const request = context.switchToHttp().getRequest();
    const currentUser: CurrentUserDto = request.user;
    return requiredRoles.some((role) => currentUser.scope.role === role);
  }
}
