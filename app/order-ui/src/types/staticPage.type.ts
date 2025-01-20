import { IBase } from './base.type'

export interface IStaticPage extends IBase {
  key: string
  title: string
  content: string
  slug: string
}

export interface ICreateStaticPage {
  key: string
  title: string
  content: string
}

export interface IUpdateStaticPage {
  slug: string
  key: string
  title: string
  content: string
}

export interface IStaticPageResponse {
  result: IStaticPage | null
}
