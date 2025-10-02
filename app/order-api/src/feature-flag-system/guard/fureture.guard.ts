import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FEATURE_KEY } from '../decorator/feature.decorator';
import { Reflector } from '@nestjs/core';
import { FeatureFlagSystemService } from '../feature-flag-system.service';
import { FeatureFlagSystemException } from '../feature-flag-system.exception';
import { FeatureFlagSystemValidation } from '../feature-flag-system.validation';

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

    const [group, feature, childFeature = null] = flagKey.split(':');

    if (!group || !feature) {
      return true;
    }

    const enabled = await this.featureFlagService.isEnabled(
      group,
      feature,
      childFeature,
    );

    if (!enabled) {
      throw new FeatureFlagSystemException(
        FeatureFlagSystemValidation.FEATURE_IS_LOCKED,
      );
    }

    return true;
  }
}
