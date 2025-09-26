import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { FEATURE_KEY } from '../decorator/feature.decorator';
import { Reflector } from '@nestjs/core';
import { FeatureFlagSystemService } from '../feature-flag-system.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagService: FeatureFlagSystemService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagKey = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!flagKey) {
      return true;
    }

    const [group, feature] = flagKey.split(':');

    if (!group || !feature) {
      return true;
    }

    const enabled = await this.featureFlagService.isEnabled(group, feature);

    if (!enabled) {
      throw new ForbiddenException(`Feature "${flagKey}" is disabled`);
    }

    return true;
  }
}
