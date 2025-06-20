import { IChefOrders } from './area.type'
import { IOrderDetail } from './dish.type'

export interface ISelectedChefOrderStore {
  chefOrderByChefAreaSlug: string
  selectedRow: string
  isSheetOpen: boolean
  chefOrder?: IChefOrders
  chefOrderStatus: string
  setChefOrderByChefAreaSlug: (slug: string) => void
  setChefOrder: (chefOrder: IChefOrders) => void
  setSelectedRow: (row: string) => void
  setIsSheetOpen: (isOpen: boolean) => void
  setChefOrderStatus: (status: string) => void
  clearSelectedChefOrder: () => void
}

export interface IChefOrderTrackingStore {
  selectedItems: IOrderDetail[]
  getSelectedItems: () => IOrderDetail[]
  isItemSelected: (orderId: string, itemIndex: number) => boolean
  addSelectedItem: (item: IOrderDetail) => void
  removeSelectedItem: (itemId: string) => void
  clearSelectedItems: () => void
}

export interface IChefOrdersQuery {
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

export interface IExportChefOrderTicketParams {
  logoString: string
  logo: string
  referenceNumber: number
  orderItem: {
    variant: {
      name: string
      size?: string
      note?: string
    }
    quantity: number
  }
}

export interface IExportChefOrderParams {
  logoString: string
  logo: string
  branchName: string
  referenceNumber: number
  createdAt: string
  type: string
  tableName: string
  invoiceItems: Array<{
    variant: {
      name: string
      size?: string
    }
    quantity: number
    note?: string
  }>
  formatDate: (date: string, format: string) => string
}
