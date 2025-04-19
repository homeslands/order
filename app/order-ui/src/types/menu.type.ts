import { IBase } from './base.type'
import { IBranch } from './branch.type'
import { IProduct } from './product.type'
import { IPromotion } from './promotion.type'

export interface IMenu extends IBase {
  date: string
  branch: IBranch
  dayIndex: number
  isTemplate: boolean
  menuItems: IMenuItem[]
}

export interface FilterState {
  menu?: string
  date: string
  branch?: string
  catalog?: string
  productName?: string
  minPrice?: number
  maxPrice?: number
}

export interface ICreateMenuRequest {
  date: string
  branchSlug: string
  isTemplate: boolean
}

export interface IAllMenuRequest {
  page: number | 1
  pageSize: number | 10
  order: 'ASC' | 'DESC'
  branch?: string
  isTemplate?: boolean
}

export interface ISpecificMenuRequest {
  slug?: string // This is the slug of the menu
  date?: string
  catalog?: string
  productName?: string
  branch?: string
  minPrice?: number
  maxPrice?: number
  promotion?: boolean
}

export interface IUpdateMenuRequest {
  slug: string // This is the slug of the menu
  date: string
  branchSlug: string
}

export interface ISpecificMenu extends IBase {
  date: string
  menuItems: IMenuItem[]
  dayIndex: number
  isTemplate: boolean
  branch: IBranch
}

export interface IMenuItem extends IBase {
  currentStock: number
  defaultStock: number
  isLocked: boolean
  promotion: IPromotion
  product: IProduct
}

export interface ICreateMenuRequest {
  date: string
  branchSlug: string
}

export interface IUpdateMenuRequest {
  slug: string // This is the slug of the menu
  date: string
  branchSlug: string
}

export interface IAddMenuItemRequest {
  menuSlug: string
  productName?: string
  productSlug: string
  defaultStock: number
  isLimit?: boolean
}

export interface IUpdateMenuItemRequest {
  slug: string
  menuSlug: string
  productName?: string
  productSlug: string
  defaultStock: number
  isLocked: boolean
  isResetCurrentStock: boolean
}

export interface IMenuItemStore {
  menuItems: IAddMenuItemRequest[]
  getMenuItems: () => IAddMenuItemRequest[]
  addMenuItem: (item: IAddMenuItemRequest) => void
  removeMenuItem: (productSlug: string) => void
  clearMenuItems: () => void
}

export interface IPriceRangeStore {
  minPrice: number
  maxPrice: number
  setPriceRange: (minPrice: number, maxPrice: number) => void
  clearPriceRange: () => void
}
