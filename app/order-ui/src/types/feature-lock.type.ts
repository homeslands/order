import { IBase } from './base.type'

export interface IFeatureLock extends IBase {
  name: string
  isLocked: boolean
  order?: number
  groupName?: string
  parentName?: string
  description?: string
  children?: IFeatureLock[]
}

export interface IFeatureLockGroup extends IBase {
  name: string
  order?: number
  features: IFeatureLock[]
  description?: string
}
