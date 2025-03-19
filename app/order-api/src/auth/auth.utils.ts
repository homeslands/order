import { Injectable } from '@nestjs/common';
import { UserScopeDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthUtils {
  buildScope(user: User): string {
    const scope: UserScopeDto = { role: user.role?.name, permissions: [] };

    const authorityGroupCodes = new Set<string>();
    user.role.permissions.forEach((permission) => {
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
