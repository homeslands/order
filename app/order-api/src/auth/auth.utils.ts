import { Injectable } from '@nestjs/common';
import { UserScopeDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { AuthValidation } from './auth.validation';
import { AuthException } from './auth.exception';
import { RoleEnum } from 'src/role/role.enum';

@Injectable()
export class AuthUtils {
  buildScope(user: User): string {
    const scope: UserScopeDto = { role: user.role?.name, permissions: [] };

    const authorityGroupCodes = new Set<string>();
    user.role?.permissions.forEach((permission) => {
      if (!authorityGroupCodes.has(permission.authority.authorityGroup.code)) {
        authorityGroupCodes.add(permission.authority.authorityGroup.code);
      }
    });

    scope.permissions = Array.from(authorityGroupCodes);

    return JSON.stringify(scope);
  }

  parseScope(scope: string): { role: string; permissions: string[] } {
    return JSON.parse(scope);
  }
}

export function checkActiveUser(user: User): void {
  if (!user?.isActive) {
    throw new AuthException(AuthValidation.USER_NOT_ACTIVE);
  }
}

export function isDefinedCustomer(user: User): boolean {
  if (
    user.role?.name === RoleEnum.Customer &&
    user.phonenumber !== 'default-customer'
  )
    return true;

  return false;
}
