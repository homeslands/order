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
  cashierId: string
  cashierName: string
  cashierPhone: string
  receipients: string[]
  giftCards: string[]
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
