import { paymentStatus } from '@/constants'
import { IBase } from './base.type'
// import { ICatalog } from './catalog.type'
import { IProduct, IProductVariant } from './product.type'
import { ISize } from './size.type'
import { ITable } from './table.type'
import { IVoucher } from './voucher.type'
import { IPromotion } from './promotion.type'
import { IChefOrderItemStatus, IChefOrders } from './area.type'
import { IRole } from './role.type'

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
  ownerRole?: string
  type: string
  // branch?: string
  orderItems: IOrderItem[]
  table?: string
  tableName?: string
  voucher?: {
    slug: string
    value: number
    isVerificationIdentity: boolean
    isPrivate: boolean
    code: string
    type: string
  } | null
  note?: string
  approvalBy?: string
  description?: string
  paymentMethod?: string
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
  size: string
  variant: string
  originalPrice?: number
  price: number
  description: string
  isLimit: boolean
  promotion?: string // promotion slug
  promotionValue?: number
  // catalog: ICatalog
  note?: string
}

export interface IOrderOwner {
  phonenumber: string
  firstName: string
  lastName: string
  createdAt: string
  slug: string
  role: IRole
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

export interface IOrder extends IBase {
  approvalBy: {
    createdAt: string
    slug: string
    firstName: string
    lastName: string
    phonenumber: string
  }
  referenceNumber: number
  chefOrders: IChefOrders[]
  type: string
  table: ITable
  payment: IPayment
  branch: string
  owner: IOrderOwner
  subtotal: number
  loss: number
  orderItems: IOrderDetail[]
  status: OrderStatus
  invoice: IOrderInvoice
  voucher: IVoucher
  isExtend?: boolean
  description?: string
}

export interface IOrderItems extends IBase {
  id?: string
  quantity: number
  subtotal: number
  note: string
  variant: IProductVariant
  trackingOrderItems: ITrackingOrderItems[]
  promotion?: IPromotion
  chefOrderItems?: IChefOrderItemStatus[]
  status: {
    PENDING: number
    COMPLETED: number
    FAILED: number
    RUNNING: number
  }
}

export interface IOrderDetail extends IBase {
  index?: number
  id?: string
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
  promotion?: IPromotion
  chefOrderItems?: IChefOrderItemStatus[]
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
  FAILED = 'failed',
  COMPLETED = 'completed',
  PAID = 'paid',
}

export enum OrderItemStatus {
  ORDER_ITEM_LIST = 'ORDER_ITEM_LIST',
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
    promotion?: string
    note: string
  }[]
  approvalBy: string
  voucher: string | null // voucher slug
  description?: string
}

export interface IAddNewOrderItemRequest {
  quantity: number
  variant: string
  note: string
  promotion: string
  order: string
}

export interface IUpdateOrderTypeRequest {
  type: string
  table: string | null
  voucher?: string | null
  description?: string
}

export interface IUpdateOrderItemRequest {
  quantity: number
  note?: string
  variant: string | IProductVariant
  promotion?: string | IPromotion
  action?: string
}
export interface IUpdateNoteRequest {
  note: string
}

export interface IUpdateOrderNoteRequest {
  description: string
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
  loss: number
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
