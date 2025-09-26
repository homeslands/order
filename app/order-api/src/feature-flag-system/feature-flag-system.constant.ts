// To implement
// In controller, use decorator @Feature()
// Example: @Feature(`${FeatureSystemGroups.GROUP_EXAMPLE}:${FeatureFlagSystems[FeatureSystemGroups.GROUP_EXAMPLE].FEATURE_EXAMPLE}`)
export enum FeatureSystemGroups {
  GROUP_EXAMPLE = 'GROUP_EXAMPLE',
  // BRANCH = 'BRANCH',
}

export const FeatureFlagSystems = {
  [FeatureSystemGroups.GROUP_EXAMPLE]: {
    FEATURE_EXAMPLE: 'FEATURE_EXAMPLE',
  },
  // [FeatureSystemGroups.BRANCH]: {
  //   CREATE: 'CREATE',
  //   UPDATE: 'UPDATE',
  //   DELETE: 'DELETE',
  //   GET_ALL: 'GET_ALL',
  //   GET_ONE: 'GET_ONE',
  // },
};
