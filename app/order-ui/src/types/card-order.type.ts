export interface ICardOrderRequest {
  customerSlug: string
  cashierSlug?: string
  cardOrderType: string
  cardSlug: string
  quantity: number
  totalAmount: number
  receipients?: IRecipient[]
}

export interface IRecipient {
  recipientSlug: string
  quantity: number
  message?: string
}

export interface ICardOrderResponse {
  id: string
  orderNumber: string
  customerSlug: string
  cashierSlug: string
  cardOrderType: string
  cardSlug: string
  quantity: number
  totalAmount: number
  recipients?: string[]
  createdAt: string
  updatedAt: string
}
