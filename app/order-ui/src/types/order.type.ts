import { IOrderDetail, IOrder } from './dish.type'

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
  branchSlug?: string
  page: number | 1
  size: number | 10
  order: 'ASC' | 'DESC'
  status?: string
  table?: string
  hasPaging?: boolean
  enabled?: boolean
}
