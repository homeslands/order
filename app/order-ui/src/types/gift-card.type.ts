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
