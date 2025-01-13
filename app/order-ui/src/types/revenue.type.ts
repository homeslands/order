import { RevenueTypeQuery } from '@/constants'
import { IBase } from './base.type'

export interface IRevenue extends IBase {
  date: string
  totalAmount: number
  totalOrder: number
}

export interface IRevenueQuery {
  startDate?: string
  endDate?: string
  type?: RevenueTypeQuery
}

export interface IBranchRevenue {
  slug: string
  branchId: string
  date: string
  totalAmount: number
  totalOrder: number
}

export interface IBranchRevenueQuery {
  branch: string
  startDate?: string
  endDate?: string
  type: RevenueTypeQuery
}
