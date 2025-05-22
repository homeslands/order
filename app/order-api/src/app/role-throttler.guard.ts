import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { roleThrottlerConfig } from 'src/config/role-throttler.config';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';

// Apply cases:
// Api private: check role
// Api public(common use for both login and no login): use @SkipThrottle()
// Api public(use only for no login user - api has the tail is 'public'): role is 'GUEST'
// get from roleThrottlerConfig
@Injectable()
export class RoleThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  // if use @SkipThrottle() => handleRequest will be skipped
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context } = requestProps;

    // set up in app.module.ts
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 1000,
    //   },
    // ]),
    let globalOptions;
    if (Array.isArray(this.options)) {
      globalOptions = _.first(this.options);
    } else if (
      typeof this.options === 'object' &&
      Array.isArray(this.options.throttlers)
    ) {
      globalOptions = _.first(this.options.throttlers);
    }

    const { req } = this.getRequestResponse(context);
    const role = req?.user?.scope?.role || 'GUEST';

    // Get limit and ttl from decorator
    // @Throttle({ default: { limit: <a>, ttl: <b> } })
    const name = 'default';
    const limitFromDecorator = this.reflector.getAllAndOverride<number>(
      'THROTTLER:LIMIT' + name,
      [context.getHandler(), context.getClass()],
    );

    const ttlFromDecorator = this.reflector.getAllAndOverride<number>(
      'THROTTLER:TTL' + name,
      [context.getHandler(), context.getClass()],
    );

    const fallbackConfig = roleThrottlerConfig[role];
    const limit =
      limitFromDecorator ?? fallbackConfig.limit ?? globalOptions.limit;
    const ttl = ttlFromDecorator ?? fallbackConfig.ttl ?? globalOptions.ttl;

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
