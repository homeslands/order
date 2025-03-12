import { IBase } from './base.type'

export interface IPromotion extends IBase {
  title: string
  branchSlug: string
  description: string
  startDate: string
  endDate: string
  type: string
  value: number
}

export interface ICreatePromotionRequest {
  title: string
  branchSlug: string
  description?: string
  startDate: string
  endDate: string
  type: string
  value: number
}

export interface IUpdatePromotionRequest {
  slug: string
  branch?: string
  title: string
  description?: string
  startDate: string
  endDate: string
  type: string
  value: number
}

export interface IApplyPromotionRequest {
  applicableSlugs: string[] //Product slug
  type: string
  promotion: string //Promotion slug
}

export interface IRemoveAppliedPromotionRequest {
  promotion: string
  applicableSlugs: string[]
  type: string
}
