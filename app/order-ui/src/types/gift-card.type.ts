import { GiftCardStatus } from '@/constants'
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
  slug: string
  serial: string
}
