import { GiftCardStatus } from '@/constants'

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

export interface IGiftCardCartItem {
  id: string
  slug: string
  title: string
  image: string
  description: string
  points: number
  price: number
  quantity: number
  isActive?: boolean
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
