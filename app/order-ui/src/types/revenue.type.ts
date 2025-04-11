import { RevenueTypeQuery } from '@/constants'
import { IBase } from './base.type'

export interface IRevenue extends IBase {
  date: string
  totalAmount: number
  totalOrder: number
}

export interface IRevenueQuery {
  branch?: string
  startDate?: string
  endDate?: string
  type?: RevenueTypeQuery
}

export interface IBranchRevenue extends IBase {
  date: string
  maxReferenceNumberOrder: number
  minReferenceNumberOrder: number
  totalAmountBank: number
  totalAmountCash: number
  totalAmountInternal: number
  originalAmount: number
  promotionAmount: number
  voucherAmount: number
  totalAmount: number
  totalOrder: number
}

export interface IAllRevenueQuery {
  startDate?: string
  endDate?: string
  type?: RevenueTypeQuery
}

export interface IBranchRevenueQuery {
  branch: string
  startDate?: string
  endDate?: string
  type?: RevenueTypeQuery
}
