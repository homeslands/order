import { RoleEnum } from '../role/role.enum';

export interface IRoleThrottlerConfig {
  ttl: number; // Time to live in milliseconds
  limit: number; // Number of requests allowed in the TTL window
}

export const roleThrottlerConfig: Record<string, IRoleThrottlerConfig> = {
  GUEST: {
    ttl: 60000,
    limit: 10,
  },
  [RoleEnum.Customer]: {
    ttl: 60000,
    limit: 100,
  },
  [RoleEnum.Staff]: {
    ttl: 60000,
    limit: 200,
  },
  [RoleEnum.Chef]: {
    ttl: 60000,
    limit: 300,
  },
  [RoleEnum.Manager]: {
    ttl: 60000,
    limit: 500,
  },
  [RoleEnum.Admin]: {
    ttl: 60000,
    limit: 1000,
  },
  [RoleEnum.SuperAdmin]: {
    ttl: 60000,
    limit: 2000,
  },
};
