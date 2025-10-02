import { FeatureFlagSystems } from './feature-flag-system.constant';

type ChildFeatureFlagChild = {
  key: string;
  description: string;
};
type FeatureFlag = {
  key: string;
  description: string;
  children?: Record<string, ChildFeatureFlagChild>;
};

type FeatureFlagSystemsType<T extends Record<string, any>> = {
  [K in keyof T]: {
    [F in keyof T[K]]: FeatureFlag;
  };
};

export type TFeatureFlagSystems = FeatureFlagSystemsType<
  typeof FeatureFlagSystems
>;

// type TFeatureFlagChildNode = {
//   key: string;
//   description: string;
// };

// type TFeatureFlagNode = {
//   key: string;
//   description: string;
//   children?: Record<string, TFeatureFlagChildNode>;
// };

// export type TFeatureFlagSystemsType = Record<
//   FeatureSystemGroups,
//   Record<string, TFeatureFlagNode>
// >;
