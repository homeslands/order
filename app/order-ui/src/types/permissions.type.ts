import { IBase } from './base.type'
import { IAuthority } from './profile.type'

export interface IPermission extends IBase {
  authority: IAuthority
}
