import { IBase } from './base.type'
import { IPermission } from './permissions.type'

export interface IRole extends IBase {
  name: string
  description: string
  permissions: IPermission[]
}

export interface IGetRolesRequest {
  role: string
  inRole: boolean
}

export interface ICreateRoleRequest {
  name: string
  description: string
}

export interface IUpdateRoleRequest {
  slug: string
  name?: string
  description?: string
}
