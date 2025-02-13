import { paymentStatus } from '@/constants'
import { IBase } from './base.type'
// import { ICatalog } from './catalog.type'
import { IProduct, IProductVariant } from './product.type'
import { ISize } from './size.type'
import { ITable } from './table.type'
import { IVoucher } from './voucher.type'

export interface IDish {
  id: number
  image: string
  name: string
  price: number
  description: string
  type: string
  main_ingredients: string[]
  availability: boolean
  preparation_time: number
  discount: number
  calories: number
}

export interface ICartItem {
  id: string
  slug: string
  owner?: string
  ownerFullName?: string
  ownerPhoneNumber?: string
  type: string
  // branch?: string
  orderItems: IOrderItem[]
  table?: string
  tableName?: string
  voucher?: {
    slug: string
    value: number
  } | null
  note?: string
  approvalBy?: string
}

export interface IOrderToUpdate {
  id: string
  slug: string
  owner?: string
  ownerFullName?: string
  ownerPhoneNumber?: string
  paymentMethod?: string
  type: string
  // branch?: string
  orderItems: IOrderItem[]
  table?: string
  tableName?: string
  note?: string
  approvalBy?: string
}

export interface IOrderItem {
  id: string
  slug: string
  image: string
  name: string
  quantity: number
  variant: string
  price: number
  description: string
  isLimit: boolean
  // catalog: ICatalog
  note?: string
}

export interface IOrderOwner {
  phonenumber: string
  firstName: string
  lastName: string
  createdAt: string
  slug: string
}

export interface IPayment extends IBase {
  paymentMethod: string
  message: string
  amount: number
  qrCode: string
  userId: string
  transactionId: string
  statusCode: paymentStatus
  statusMessage: string
}

export interface IOrder {
  createdAt: string
  slug: string
  type: string
  table: ITable
  payment: IPayment
  branch: string
  owner: IOrderOwner
  subtotal: number
  orderItems: IOrderDetail[]
  status: OrderStatus
  invoice: IOrderInvoice
  voucher: IVoucher
}

export interface IOrderDetail extends IBase {
  index?: number
  id: string
  note: string
  quantity: number
  status: {
    PENDING: number
    COMPLETED: number
    FAILED: number
    RUNNING: number
  }
  subtotal: number
  variant: IProductVariant
  size: ISize
  trackingOrderItems: ITrackingOrderItems[]
}

export interface IOrderDetailForTracking extends IBase {
  id: string
  key: string
  note: string
  quantity: number
  status: {
    PENDING: number
    COMPLETED: number
    FAILED: number
    RUNNING: number
  }
  subtotal: number
  variant: IProductVariant
  size: ISize
  trackingOrderItems: ITrackingOrderItems[]
}

export interface ITrackingOrderItems extends IBase {
  id: string
  quantity: number
  tracking: {
    createdAt: string
    slug: string
    id: string
    status: OrderItemStatus
    workflowExecution: string
  }
}

export enum OrderStatus {
  ALL = 'all',
  PENDING = 'pending',
  SHIPPING = 'shipping',
  FAILED = 'FAILED',
  COMPLETED = 'completed',
  PAID = 'paid',
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum OrderTypeEnum {
  AT_TABLE = 'at-table',
  TAKE_OUT = 'take-out',
}

export interface ICreateOrderResponse extends IBase {
  subtotal: number
  type: string
  tableName: string
  branch: string
  owner: {
    phonenumber: string
    firstName: string
    lastName: string
    createdAt: string
    slug: string
  }
  orderItems: {
    quantity: number
    subtotal: number
    variant: {
      price: number
      createdAt: string
      slug: string
      product: IProduct
    }
    note: string
    slug: string
  }[]
}

export interface ICreateOrderRequest {
  type: string
  table: string
  branch: string
  owner: string
  orderItems: {
    quantity: number
    variant: string
    note: string
  }[]
  approvalBy: string
  voucher: string | null // voucher slug
}

export interface IAddNewOrderItemRequest {
  quantity: number
  variant: string
  note: string
  order: string
}

export interface IUpdateOrderTypeRequest {
  type: string
  table: string | null
}

export interface IInitiatePaymentRequest {
  paymentMethod: string
  orderSlug: string
}

export interface IInitiatePaymentResponse {
  requestTrace: string
  qrCode: string
}

export interface IOrderTracking extends IBase {
  status: string
  trackingOrderItems: {
    quantity: number
    orderItem: {
      quantity: number
      subtotal: number
      note: string
      createdAt: string
      slug: string
    }
    createdAt: string
    slug: string
  }
}

export interface ICreateOrderTrackingRequest {
  type: string
  trackingOrderItems: {
    quantity: number
    orderItem: string
  }[]
}

export interface IOrderInvoice {
  paymentMethod: string
  amount: number
  status: paymentStatus
  logo: string
  tableName: string
  branchAddress: string
  cashier: string
  customer: string
  invoiceItems: {
    productName: string
    quantity: number
    price: number
    total: number
    size: string
    createdAt: string
    slug: string
  }[]
  createdAt: string
  slug: string
}

export interface IGetOrderInvoiceRequest {
  order: string // order slug
  slug: string // invoice slug
}
