// import { IBase } from './base.type'
import { RevenueTypeQuery } from '@/constants'
import { IBranch } from './branch.type'
import { ICatalog } from './catalog.type'

export interface IProduct {
  name: string
  description: string
  isActive: boolean
  isLimit: boolean
  isTopSell: boolean
  isNew: boolean
  isCombo: boolean
  image: string
  images: string[]
  rating: number
  catalog: ICatalog
  variants: IProductVariant[]
  slug: string
  note?: string
  createdAt: string
  saleQuantityHistory: number
  productChefArea: string // Slug of the product in chef area
}

export interface IProductRequest {
  page?: number
  size?: number
  catalog?: string
  promotion?: string // get all products base on promotion
  voucher?: string // get all products base on voucher
  isAppliedPromotion?: boolean
  isAppliedBranchForChefArea?: boolean
  isAppliedVoucher?: boolean
  isTopSell?: boolean
  isNew?: boolean
  inMenu?: boolean
  isPossibleCreateMenuItemForBranch?: boolean
  menu?: string //Slug of the menu, get all products in the menu
  branch?: string //Slug of the branch
  hasPaging?: boolean
}

export interface ITopProduct {
  slug: string
  orderDate: string
  product: IProduct
  totalQuantity: number
}

export interface IBranchTopProduct {
  branch: IBranch
  slug: string
  orderDate: string
  product: IProduct
  totalQuantity: number
}

export interface IProductVariant {
  price: number
  product: IProduct
  size: {
    name: string
    description: string
    slug: string
  }
  slug: string
}

export interface ICreateProductRequest {
  name: string
  description?: string
  isLimit: boolean
  isTopSell: boolean
  isNew: boolean
  isCombo: boolean
  catalog: string
}

export interface IUpdateProductRequest {
  slug: string //Slug of the product
  name: string
  description?: string
  isLimit: boolean
  isTopSell: boolean
  isNew: boolean
  isCombo: boolean
  isActive?: boolean
  catalog: string
}

export interface ICreateProductVariantRequest {
  price: number
  size: string //Slug of size of the product
  product: string //Slug of the product
}

// export interface IProductVariant extends IBase {
//   price: number
//   size: {
//     name: string
//     description: string
//     slug: string
//   }
// }

export interface IUpdateProductVariantRequest {
  price: number
  product: string //Slug of the product
}

export interface ITopProductQuery {
  page: number
  size: number
  hasPaging: boolean
}

export interface ITopBranchProductQuery {
  branch?: string //Slug of the branch
  startDate?: string
  endDate?: string
  type?: RevenueTypeQuery
  page: number
  size: number
  hasPaging?: boolean
}

export interface IRefreshProductAnalysisRequest {
  startDate: string
  endDate: string
}
