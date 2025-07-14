import { ICartItem, OrderTypeEnum, ITable, IUserInfo, IVoucher } from '@/types'

export interface ICartItemStore {
  cartItems: ICartItem | null
  lastModified: number | null
  isHydrated: boolean
  getCartItems: () => ICartItem | null
  addCustomerInfo: (owner: IUserInfo) => void
  removeCustomerInfo: () => void
  addApprovalBy: (approvalBy: string) => void
  addCartItem: (item: ICartItem) => void
  addProductVariant: (id: string) => void
  updateCartItemQuantity: (id: string, quantity: number) => void
  addNote: (id: string, note: string) => void
  addOrderNote: (note: string) => void
  addOrderType: (orderType: OrderTypeEnum) => void
  addTable: (table: ITable) => void
  removeTable: () => void
  addPaymentMethod: (paymentMethod: string) => void
  removeCartItem: (cartItemId: string) => void
  addVoucher: (voucher: IVoucher) => void
  removeVoucher: () => void
  setPaymentMethod: (paymentMethod: string) => void
  setOrderSlug: (orderSlug: string) => void
  setQrCode: (qrCode: string) => void
  setPaymentSlug: (paymentSlug: string) => void
  clearCart: () => void
}

export interface ICartCalculationResult {
  subTotalBeforeDiscount: number
  subTotal: number
  subTotalAfterPromotion: number
  promotionDiscount: number
  itemLevelDiscount: number
  orderLevelDiscount: number
  totalDiscount: number
  // totalAfterDiscount?: number
}
