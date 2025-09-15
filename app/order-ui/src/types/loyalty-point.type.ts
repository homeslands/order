import { LoyaltyPointHistoryType } from '@/constants'
import { IBase } from './base.type'

export interface ILoyaltyPoint extends IBase {
  totalPoints: number
}

export interface IUseLoyaltyPointResponse {
  finalAmount: number
  pointsUsed: number
}

export interface ILoyaltyPointHistory extends IBase {
  id: string
  type: string
  points: number
  lastPoints: number
  orderSlug: string
  date: string
}

export interface ILoyaltyPointHistoryQuery {
  slug: string // user slug
  page?: number
  size?: number
  hasPaging?: boolean
  sort?: string
  types?: LoyaltyPointHistoryType[]
  fromDate?: string
  toDate?: string
}
