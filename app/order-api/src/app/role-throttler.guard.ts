import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { roleThrottlerConfig } from '../config/role-throttler.config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context } = requestProps;

    const { req } = this.getRequestResponse(context);
    const role = req?.user?.scope?.role || 'GUEST';

    const { limit, ttl } = roleThrottlerConfig[role];

    const tracker = await this.getTracker(req);
    const handler = context.getHandler();
    const classRef = context.getClass();
    const routeKey = this.generateKey(context, handler.name, classRef.name);
    const key = `${tracker}_${routeKey}`;
    const blockDuration = ttl;

    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        'role-throttler',
      );

    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    return true;
  }
}
