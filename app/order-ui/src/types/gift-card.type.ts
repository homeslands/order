import { GiftCardStatus, GiftCardType, GiftCardUsageStatus } from '@/constants'
import { ICardOrderResponse } from './card-order.type'

export interface IGiftCard {
  slug: string
  image: string
  title: string
  description: string
  points: number
  price: number
  isActive: boolean
}

export interface IGiftCardRequest {
  branch: string
  status?: GiftCardStatus
  page?: number
  limit?: number
}

export interface IGiftCardCreateRequest {
  image?: string
  title?: string
  description?: string
  points?: number
  amount?: number
  file?: File
  isActive?: boolean
}

export interface IGiftCardGetRequest {
  status?: GiftCardUsageStatus
  page?: number
  size?: number
  sort?: string
  fromDate?: string
  toDate?: string
  customerSlug?: string
}

export interface IGiftCardUpdateRequest {
  image?: string
  title?: string
  description?: string
  points?: number
  price?: number
  file?: File
  isActive?: boolean
}

export interface IGetGiftCardsRequest {
  page?: number
  size?: number
  sort?: string
  isActive?: boolean | null
}

export interface IGiftCardCartTotal {
  subtotal: number
  totalPoints: number
  quantity: number
}

export interface IReceiverInfo {
  id: string
  phone: string
  quantity: number
  note: string
}

export interface IGiftCardItem {
  id: string
  title: string
  image: string
  price: number
  points: number
  quantity: number
}

export interface IGiftCardDetail {
  cardName: string
  cardPoints: number
  status: string
  usedAt: string | null
  cardOrder: ICardOrderResponse
  createdAt: string
  expiredAt: string
  slug: string
  serial: string
  usedBy: IUserGiftCard
  code: string
  usedBySlug: string
}

export interface IUseGiftCardResponse {
  cardName: string
  cardPoints: number
  status: string
  usedAt: string
  code: string
  serial: string
  expiredAt: string
  createdAt: string
  slug: string
}

export interface IUseGiftCardRequest {
  serial: string
  code: string
  userSlug: string
}
export interface IGiftCardFlag {
  slug: string
  name: string
  features: IGiftCardFlagFeature[]
  order: number
}

export interface IGiftCardFlagFeature {
  slug: string
  groupName: string
  groupSlug: string
  name: GiftCardType
  isLocked: boolean
  order: number
}

export interface IUserGiftCard {
  createdAt: string
  slug: string
  phonenumber: string
  firstName: string
  lastName: string
  dob: string
  email: string
  address: string
  isVerifiedEmail: boolean
  isVerifiedPhonenumber: boolean
}
