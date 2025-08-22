import { IGiftCardDetail } from './gift-card.type'
import { IUserInfo } from './user.type'

export type IUserInfoBasic = Pick<
  IUserInfo,
  'slug' | 'lastName' | 'phonenumber'
>

export interface ICardOrderRequest {
  customerSlug: string
  cashierSlug?: string
  cardOrderType: string
  cardSlug: string
  quantity: number
  totalAmount: number
  receipients?: IRecipient[]
  cardVersion: number
}

export interface ICardOrderGetRequest {
  page?: number
  size?: number
  sort?: string
  fromDate?: string
  toDate?: string
  status?: string
  customerSlug?: string
}

export interface IRecipient {
  recipientSlug: string
  quantity: number
  message?: string
  name?: string
  phone?: string
}
export interface ICardOrderResponse {
  slug: string
  type: string
  status: string
  totalAmount: number
  orderDate: string
  quantity: number
  cardId: string
  cardTitle: string
  cardPoint: number
  cardImage: string
  cardPrice: number
  customerId: string
  customerName: string
  customerPhone: string
  customerSlug: string
  cashierId: string
  cashierName: string
  cashierPhone: string
  receipients: IReceiverGiftCardResponse[]
  giftCards: IGiftCardDetail[]
  cardSlug: string
  paymentStatus: string
  paymentMethod: string
  payment: IPaymentMenthod
  createdAt?: string
  updatedAt?: string
}

export interface IPaymentMenthod {
  amount: number
  createdAt: string
  loss: number
  message: string
  paymentMethod: string
  qrCode: string
  slug: string
  statusCode: string
  statusMessage: string
  transactionId: string
  userId: string
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
  receipients?: IReceiverGiftCardCart[]
  isActive?: boolean
  type?: string
  version?: number
  customerInfo?: IUserInfoBasic
}

export interface IReceiverGiftCardCart {
  recipientSlug: string
  quantity: number
  message?: string
  slug?: string
}

export interface IReceiverGiftCardResponse {
  createdAt: string
  message: string
  name: string
  phone: string
  quantity: number
  recipientId: string
  senderId: string
  senderName: string
  senderPhone: string
  slug: string
  status: string
  recipientSlug: string
}
