import { IBase } from './base.type'
import { IBranch } from './branch.type'
import { IProduct, IProductVariant } from './product.type'

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
}

export interface IChefOrderItem extends IBase {
  quantity: number
  subtotal: number
  note: string
  variant: IProductVariant
}

export interface IChefOrderItems {
  status: ChefOrderItemStatus
  defaultQuantity: number
  createdAt: string
  slug: string
  orderItem: IChefOrderItem
  chefOrder: {
    createdAt: string
    slug: string
  }
}
export interface IChefOrderInfo extends IBase {
  subtotal: number
  status: string
  type: string
}

export interface IChefOrders extends IBase {
  status: ChefOrderStatus
  order: IChefOrderInfo
  chefOrderItems: IChefOrderItems[]
}

export interface IUpdateChefOrderStatusRequest {
  slug: string
  status: string
}

export interface IUpdateChefOrderItemStatusRequest {
  slug: string
  status: string
}
