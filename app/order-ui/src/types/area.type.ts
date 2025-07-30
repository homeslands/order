import { PrinterDataType, PrinterJobType } from '@/constants'
import { IBase } from './base.type'
import { IBranch } from './branch.type'
import { IProduct, IProductVariant } from './product.type'
import { ITable } from './table.type'

export enum ChefOrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum ChefOrderItemStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
}

export interface IChefArea extends IBase {
  name: string
  description: string
  branch: IBranch
  productChefAreas: IChefAreaProduct[]
}

export interface ICreateChefAreaRequest {
  branch: string
  name: string
  description?: string
}

export interface IUpdateChefAreaRequest {
  slug: string
  branch: string
  name: string
  description?: string
}

export interface IChefAreaProduct extends IBase {
  chefArea: IChefArea
  products: IProduct[]
}

export interface ICreateChefAreaProductRequest {
  chefArea: string
  products: string[]
}

export interface IUpdateChefAreaProductRequest {
  chefAreaProduct: string // This should be chefAreaProduct slug
  chefArea: string
  product: string
}

export interface IGetChefOrderRequest {
  chefArea?: string
  status?: string
  order?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export interface ICreateChefOrderRequest {
  order: string // slug of order
}

export interface IChefOrders extends IBase {
  status: ChefOrderStatus
  order: IChefOrderInfo
  chefOrderItems: ISpecificChefOrderItemInfo[]
  printerChefOrders: IPrinterChefOrders[]
  printerLabels: IPrinterLabels[]
}

export interface IChefSpecificOrder extends IBase {
  chefOrderItems: ISpecificChefOrderItemInfo[]
  status: ChefOrderStatus
}

export interface ISpecificChefOrderItemInfo extends IBase {
  status: ChefOrderItemStatus
  defaultQuantity: number
  orderItem: ISpecificChefOrderItemDetail
  chefOrder: {
    createdAt: string
    slug: string
  }
}

export interface ISpecificChefOrderItemDetail extends IBase {
  quantity: number
  subtotal: number
  note: string
  variant: IProductVariant
}

export interface IChefOrderItemStatus extends IBase {
  status: ChefOrderItemStatus
  defaultQuantity: number
}

export interface IChefOrderInfo extends IBase {
  referenceNumber: number
  subtotal: number
  status: string
  type: string
  table: ITable
  description: string
}

export interface IUpdateChefOrderStatusRequest {
  slug: string
  status: string
}

export interface IUpdateChefOrderItemStatusRequest {
  slug: string
  status: string
}

export interface IPrinterForChefArea extends IBase {
  name: string
  dataType: PrinterDataType
  ip: string
  port: string
  description?: string
  chefArea: IChefArea
  isActive: boolean
}

export interface IPrinterChefOrders extends IBase {
  jobType: string
  status: PrinterJobType
}

export interface IPrinterLabels extends IBase {
  jobType: string
  status: PrinterJobType
}

export interface ICreatePrinterForChefAreaRequest {
  slug: string // This is the slug of the chef area
  name: string
  dataType: PrinterDataType
  ip: string
  port: string
  description?: string
}

export interface IUpdatePrinterForChefAreaRequest {
  slug: string // This is the slug of the chef area
  printerSlug: string // This is the slug of the printer
  name: string
  dataType: PrinterDataType
  ip: string
  port: string
  description?: string
}
