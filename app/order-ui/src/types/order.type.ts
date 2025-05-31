import { IOrder, IOrderDetail } from './dish.type'

export interface IOrderStore {
  order: IOrder | null
  getOrder: () => IOrder | null
  addOrder: (order: IOrder) => void
  removeOrder: () => void
}

export interface ISelectedOrderStore {
  orderSlug: string
  selectedRow: string
  isSheetOpen: boolean
  setOrderSlug: (slug: string) => void
  setSelectedRow: (row: string) => void
  setIsSheetOpen: (isOpen: boolean) => void
  clearSelectedOrder: () => void
}

export interface IOrderTrackingStore {
  selectedItems: IOrderDetail[]
  getSelectedItems: () => IOrderDetail[]
  isItemSelected: (orderId: string, itemIndex: number) => boolean
  addSelectedItem: (item: IOrderDetail) => void
  removeSelectedItem: (itemId: string) => void
  clearSelectedItems: () => void
}

export interface IOrdersQuery {
  owner?: string
  branch?: string
  startDate?: string
  endDate?: string
  page: number | 1
  size: number | 10
  order: 'ASC' | 'DESC'
  status?: string
  table?: string
  hasPaging?: boolean
  enabled?: boolean
}

export enum DeliveryOrderType {
  PENDING = 'PENDING',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IExportOrderInvoiceParams {
  logoString: string
  logo: string
  branchAddress: string
  referenceNumber: number
  createdAt: string
  type: string
  tableName: string
  customer: string
  cashier: string
  invoiceItems: Array<{
    variant: {
      name: string
      originalPrice: number
      price: number
      size?: string
    }
    quantity: number
    promotionValue?: number
  }>
  paymentMethod: string
  subtotalBeforeVoucher: number
  voucherType: string
  voucherValue: number
  promotionDiscount: number
  amount: number
  loss: number
  qrcode: string
  formatCurrency: (value: number) => string
  formatDate: (date: string, format: string) => string
  formatPaymentMethod: (method: string) => string
}
