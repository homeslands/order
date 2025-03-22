import { IBase } from './base.type'

export interface ICatalog extends IBase {
  slug: string
  name: string
  description: string
}

export interface ICreateCatalogRequest {
  name: string
  description?: string
}

export interface IUpdateCatalogRequest {
  slug: string //Slug of the catalog
  name: string
  description?: string
}
