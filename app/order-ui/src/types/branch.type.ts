import { IBase } from './base.type'

export interface IBranch extends IBase {
  name: string
  address: string
  addressDetail: {
    slug: string
    formattedAddress: string
    lat: number
    lng: number
    url: string
  }
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
