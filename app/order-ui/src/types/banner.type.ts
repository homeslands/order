import { IBase } from './base.type'

export interface IBanner extends IBase {
  title: string
  content: string
  image: string
  isActive: boolean
}

export interface ICreateBannerRequest {
  title: string
  content: string
  image?: string
  isActive?: boolean
}

export interface IUpdateBannerRequest {
  slug: string
  title: string
  content: string
  image?: string
  isActive?: boolean
}
