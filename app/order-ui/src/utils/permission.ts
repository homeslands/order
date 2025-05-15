// utils/permissionUtils.ts
export const hasPermissionInBoth = (
  permissionCode: string,
  authorityGroupCodes: string[],
  userPermissionCodes: string[],
): boolean => {
  const inAuthorityGroup = authorityGroupCodes.includes(permissionCode)
  const inUserPermissions = userPermissionCodes.includes(permissionCode)

  return inAuthorityGroup && inUserPermissions
}
