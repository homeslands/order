// To implement
// In controller, use decorator @Feature()
// Example: @Feature(`${FeatureSystemGroups.GROUP_EXAMPLE}:${FeatureFlagSystems[FeatureSystemGroups.GROUP_EXAMPLE].FEATURE_EXAMPLE}`)
export enum FeatureSystemGroups {
  GROUP_EXAMPLE = 'GROUP_EXAMPLE',
}

// if don't have children, don't put children in the object
// example:
// {
//   [FeatureSystemGroups.GROUP_EXAMPLE]: {
//     FEATURE_EXAMPLE: {
//       key: 'FEATURE_EXAMPLE',
//       description: 'Feature Example',
//     },
//   },
// }
export const FeatureFlagSystems = {
  [FeatureSystemGroups.GROUP_EXAMPLE]: {
    FEATURE_EXAMPLE: {
      key: 'FEATURE_EXAMPLE',
      description: 'Feature Example',
      children: {
        CHILD_FEATURE_EXAMPLE: {
          key: 'CHILD_FEATURE_EXAMPLE',
          description: 'Child Feature Example',
        },
      },
    },
  },
} as const;
