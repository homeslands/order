import {
  ICartItem,
  IOrder,
  IOrderToUpdate,
  OrderTypeEnum,
  ITable,
  IVoucher,
  IOrderOwner,
  OrderStatus,
} from '@/types'

export interface IUpdateOrderStore {
  orderItems: IOrderToUpdate | null
  isHydrated: boolean
  getOrderItems: () => IOrderToUpdate | null
  clearStore: () => void
  setOrderItems: (order: IOrder) => void
  addCustomerInfo: (owner: IOrderOwner) => void
  addStatus: (status: OrderStatus) => void
  removeStatus: () => void
  removeCustomerInfo: () => void
  addApprovalBy: (approvalBy: string) => void
  addOrderItem: (item: ICartItem) => void
  addProductVariant: (id: string) => void
  updateOrderItemQuantity: (id: string, quantity: number) => void
  addNote: (id: string, note: string) => void
  addOrderType: (orderType: OrderTypeEnum) => void
  addOrderNote: (note: string) => void
  addTable: (table: ITable) => void
  removeTable: () => void
  addPaymentMethod: (paymentMethod: string) => void
  removeOrderItem: (cartItemId: string) => void
  addVoucher: (voucher: IVoucher) => void
  removeVoucher: () => void
  setPaymentMethod: (paymentMethod: string) => void
  setOrderSlug: (orderSlug: string) => void
  setQrCode: (qrCode: string) => void
  setPaymentSlug: (paymentSlug: string) => void
  // clearCart: () => void
}

export interface IOriginalOrderStore {
  originalOrderItems: IOrderToUpdate | null
  getOriginalOrderItems: () => IOrderToUpdate | null
  clearOriginalStore: () => void
  setOriginalOrderItems: (order: IOrder) => void
  addOriginalCustomerInfo: (owner: IOrderOwner) => void
  removeOriginalCustomerInfo: () => void
  addOriginalStatus: (status: OrderStatus) => void
  removeOriginalStatus: () => void
  addOriginalApprovalBy: (approvalBy: string) => void
  addOriginalOrderItem: (item: ICartItem) => void
  addOriginalProductVariant: (id: string) => void
  updateOriginalOrderItemQuantity: (id: string, quantity: number) => void
  addOriginalNote: (id: string, note: string) => void
  addOriginalOrderType: (orderType: OrderTypeEnum) => void
  addOriginalOrderNote: (note: string) => void
  addOriginalTable: (table: ITable) => void
  removeOriginalTable: () => void
  addOriginalPaymentMethod: (paymentMethod: string) => void
  removeOriginalOrderItem: (cartItemId: string) => void
  addOriginalVoucher: (voucher: IVoucher) => void
  removeOriginalVoucher: () => void
  setOriginalPaymentMethod: (paymentMethod: string) => void
  setOriginalOrderSlug: (orderSlug: string) => void
  setOriginalQrCode: (qrCode: string) => void
  setOriginalPaymentSlug: (paymentSlug: string) => void
  // clearCart: () => void
}
