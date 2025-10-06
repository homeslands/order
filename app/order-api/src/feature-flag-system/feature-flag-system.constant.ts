// To implement
// In controller, use decorator @Feature()
// Example: @Feature(`${FeatureSystemGroups.GROUP_EXAMPLE}:${FeatureFlagSystems[FeatureSystemGroups.GROUP_EXAMPLE].FEATURE_EXAMPLE}`)
export enum FeatureSystemGroups {
  GROUP_EXAMPLE = 'GROUP_EXAMPLE',
  ORDER = 'ORDER',
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
  [FeatureSystemGroups.ORDER]: {
    // user logged in: in
    CREATE_PRIVATE: {
      key: 'CREATE_PRIVATE',
      description:
        'Create, update order for user logged in. About type, include all types (at table, take out, delivery). About permission, include: logged customer buy for themselves, staff buy for customer do not account',
      children: {
        AT_TABLE: {
          key: 'AT_TABLE',
          description:
            'Create, update order for user logged in for at table type',
        },
        TAKE_OUT: {
          key: 'TAKE_OUT',
          description:
            'Create, update order for user logged in for take out type',
        },
        DELIVERY: {
          key: 'DELIVERY',
          description:
            'Create, update order for user logged in for delivery type',
        },
      },
    },
    // user not logged in
    CREATE_PUBLIC: {
      key: 'CREATE_PUBLIC',
      description:
        'Create, update order for user not logged in. About type, include all types (at table, take out). About permission, include: public user buy for themselves',
      children: {
        AT_TABLE: {
          key: 'AT_TABLE',
          description:
            'Create, update order for user not logged in for at table type',
        },
        TAKE_OUT: {
          key: 'TAKE_OUT',
          description:
            'Create, update order for user not logged in for take out type',
        },
      },
    },
  },
} as const;
