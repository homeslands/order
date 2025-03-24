import { IBase } from './base.type'
import { IBranch } from './branch.type'
import { IProduct } from './product.type'

export interface IChefArea extends IBase {
  name: string
  description: string
  branch: IBranch
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
  product: IProduct
}

export interface ICreateChefAreaProductRequest {
  chefArea: string
  product: string[]
}

export interface IUpdateChefAreaProductRequest {
  chefAreaProduct: string // This should be chefAreaProduct slug
  chefArea: string
  product: string
}
