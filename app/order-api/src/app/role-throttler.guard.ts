import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { RoleEnum } from 'src/role/role.enum';

// Apply cases:
// Api private: check role
// Api public(common use for both login and no login): use @SkipThrottle()
// Api public(use only for no login user - api has the tail is 'public'): role is 'GUEST'
// get from roleThrottlerConfig
@Injectable()
export class RoleThrottlerGuard extends ThrottlerGuard implements OnModuleInit {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly systemConfigService: SystemConfigService,
  ) {
    super(options, storageService, reflector);
  }

  async getConfigRateLimit(role: string) {
    switch (role) {
      case RoleEnum.Customer:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.customerLimitTime,
        };
      case RoleEnum.Staff:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.staffLimitTime,
        };
      case RoleEnum.Chef:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.chefLimitTime,
        };
      case RoleEnum.Manager:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.managerLimitTime,
        };
      case RoleEnum.Admin:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.adminLimitTime,
        };
      case RoleEnum.SuperAdmin:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.superAdminLimitTime,
        };
      default:
        return {
          ttl: await this.systemConfigService.requestTtl,
          limit: await this.systemConfigService.guestLimitTime,
        };
    }
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
    const role = req?.user?.scope?.role;

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

    // const fallbackConfig = roleThrottlerConfig[role];
    const fallbackConfig = await this.getConfigRateLimit(role);

    const limit =
      limitFromDecorator ?? fallbackConfig.limit ?? globalOptions.limit;
    const ttl = ttlFromDecorator ?? fallbackConfig.ttl ?? globalOptions.ttl;

    const tracker = await this.getTracker(req);
    const handler = context.getHandler();
    const classRef = context.getClass();
    const routeKey = this.generateKey(context, handler.name, classRef.name);
    const key = `${tracker}_${routeKey}`;
    const blockDuration = await this.systemConfigService.blockRequestDuration;

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
