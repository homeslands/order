import { IBase } from './base.type'

export interface IVoucherGroup extends IBase {
  title: string
  description?: string
}

export interface ICreateVoucherGroupRequest {
  title: string
  description?: string
}

export interface IUpdateVoucherGroupRequest {
  slug: string
  title: string
  description?: string
}

export interface IVoucher extends IBase {
  voucherGroup: string
  title: string
  description?: string
  code: string
  value: number
  type: string
  maxUsage: number
  isActive: boolean
  isPrivate: boolean
  numberOfUsagePerUser: number
  minOrderValue: number
  remainingUsage: number
  startDate: string
  endDate: string
  isVerificationIdentity?: boolean
}

export interface IGetAllVoucherRequest {
  order?: string
  voucherGroup?: string
  minOrderValue?: number
  isVerificationIdentity?: boolean
  date?: string
  isActive?: boolean
  isPrivate?: boolean
  hasPaging?: boolean
  page?: number | 1
  size?: number | 10
}

export interface IGetAllVoucherGroupRequest {
  hasPaging?: boolean
  page?: number | 1
  size?: number | 10
}

export interface ICreateVoucherRequest {
  title: string
  description?: string
  code: string
  value: number
  maxUsage: number
  minOrderValue: number
  isActive: boolean
  startDate: string
  endDate: string
}

export interface IUpdateVoucherRequest {
  slug: string
  voucherGroup: string
  title: string
  description?: string
  code: string
  value: number
  maxUsage: number
  minOrderValue: number
  isActive: boolean
  remainingUsage: number
  isPrivate: boolean
  isVerificationIdentity: boolean
  type: string
  numberOfUsagePerUser: number
  startDate: string
  endDate: string
}

export interface ICreateMultipleVoucherRequest {
  voucherGroup: string
  numberOfVoucher: number
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  value: number
  maxUsage: number
  minOrderValue: number
  isActive: boolean
  isPrivate: boolean
  isVerificationIdentity: boolean
  numberOfUsagePerUser: number
}

export interface IValidateVoucherRequest {
  voucher: string
  user: string //user slug
}
export interface IGetSpecificVoucherRequest {
  slug?: string
  code?: string
}
