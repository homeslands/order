import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature_flag';
export const Feature = (flagKey: string) => SetMetadata(FEATURE_KEY, flagKey);
