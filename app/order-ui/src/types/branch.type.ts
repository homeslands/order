import { IBase } from './base.type'

export interface IBranch extends IBase {
  name: string
  address: string
}

export interface ICreateBranchRequest {
  name: string
  address: string
}

export interface IUpdateBranchRequest {
  slug: string
  name: string
  address: string
}
