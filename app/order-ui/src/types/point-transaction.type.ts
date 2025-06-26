import { IUserInfo } from './user.type'

export interface IPointTransaction {
  slug: string
  type: string
  desc: string
  objectType: string
  objectSlug: string
  points: number
  user: IUserInfo
  userSlug: string
  createdAt?: string
}

export interface IPointTransactionQuery {
  page?: number
  size?: number
  userSlug?: string
  sort?: string[]
}
