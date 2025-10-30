import { APPLICABILITY_RULE, VOUCHER_PAYMENT_METHOD } from '@/constants'
import { IBase } from './base.type'
import { IProduct } from './product.type'

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
  applicabilityRule: APPLICABILITY_RULE
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
  isUserGroup: boolean
  voucherProducts: IVoucherProduct[] //Product slug
  voucherPaymentMethods: {
    paymentMethod: (typeof VOUCHER_PAYMENT_METHOD)[keyof typeof VOUCHER_PAYMENT_METHOD]
    createdAt: string
    slug: string
  }[]
}

export interface IVoucherProduct {
  slug: string
  createdAt: string
  product: IProduct
}

export interface IGetAllVoucherRequest {
  hasPaging?: boolean
  page?: number | 1
  size?: number | 10
  sort?: 'DESC' | 'ASC'
  orderItems?: {
    quantity: number
    variant: string
    promotion: string
    order: string
  }[]
  user?: string // order owner slug
  voucherGroup?: string
  minOrderValue?: number
  paymentMethod?: string
  userGroups?: string // user group slug
  isActive?: boolean
  isPrivate?: boolean
  isVerificationIdentity?: boolean
  isAppliedUserGroup?: boolean
  isUserGroup?: boolean
  date?: string
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
  products: string[] //Product slug
}

export interface IUpdateVoucherRequest {
  slug: string
  voucherGroup: string
  createdAt: string
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
  products: string[] //Product slug
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
  products: string[] //Product slug
}

export interface IValidateVoucherRequest {
  voucher: string
  user: string //user slug
  orderItems: {
    quantity?: number
    variant?: string
    note?: string
    promotion?: string | null
    order?: string | null
  }[]
}

export interface IValidateVoucherPaymentMethodRequest {
  slug: string
  paymentMethod: string
}

export interface IOrderItemsParam {
  quantity?: number
  variant?: string
  note?: string
  promotion?: string | null
  order?: string | null
}
export interface IGetSpecificVoucherRequest {
  slug?: string
  code?: string
}

export interface IApplyVoucherRequest {
  products: string[] //Product slug
  vouchers: string[] //Voucher slug
}

export interface IRemoveAppliedVoucherRequest {
  products: string[] //Product slug
  vouchers: string[] //Voucher slug
}

export interface IRemoveAppliedVoucherForUserGroupRequest {
  userGroups: string[] //User group slug
  vouchers: string[] //Voucher slug
}

export interface IUpdateVoucherPaymentMethodRequest {
  voucher: string //Voucher slug
  paymentMethods: string[]
}

export interface IUpdateVoucherPaymentMethodParamToRequest {
  voucher: string //Voucher slug
  paymentMethod: string
}

export interface IVoucherPaymentMethodDiff {
  voucher: string //Voucher slug
  originalPaymentMethods: string[]
  newPaymentMethods: string[]
  toAdd: string[]
  toRemove: string[]
}

export interface ICreateVoucherForUserGroupRequest {
  userGroups: string[] //User group slug
  vouchers: string[] //Voucher slug
}

export interface ICreateVoucherForUserGroupResponse {
  userGroup: string //User group slug
  vouchers: string[] //Voucher slug
}

export interface IDeleteVoucherForUserGroupRequest {
  userGroups: string[] //User group slug
  vouchers: string[] //Voucher slug
}
