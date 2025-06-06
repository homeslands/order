import { z } from 'zod'
import { GiftCardType } from '@/constants'

export const createGiftCardSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.optional(z.string().max(1000)),
  file: z.optional(z.instanceof(File)),
  points: z.coerce.number().min(1000).max(10000000),
  price: z.coerce.number().min(1000).max(10000000),
  isActive: z.boolean().default(true),
})

export const updateGiftCardSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.optional(z.string().max(1000)),
  points: z.coerce.number().min(1000).max(10000000),
  price: z.coerce.number().min(1000).max(10000000),
  file: z.optional(z.instanceof(File)),
  isActive: z.boolean().default(true),
})

export const receiverSchema = z.object({
  recipientSlug: z.string().min(1, 'Recipient is required'),
  quantity: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  message: z.string().optional(),
})

export const createGiftCardCheckoutSchema = (maxQuantity?: number) =>
  z
    .object({
      giftType: z.enum(Object.values(GiftCardType) as [string, ...string[]]),
      receivers: z.array(receiverSchema).optional(),
    })
    .refine(
      (data) => {
        if (data.giftType === GiftCardType.GIFT) {
          return data.receivers && data.receivers.length > 0
        }
        return true
      },
      {
        message: 'Receivers are required when gifting to others',
        path: ['receivers'],
      },
    )
    .refine(
      (data) => {
        if (
          data.giftType === GiftCardType.GIFT &&
          data.receivers &&
          maxQuantity
        ) {
          const totalReceiverQuantity = data.receivers.reduce(
            (sum, receiver) => sum + receiver.quantity,
            0,
          )
          return totalReceiverQuantity <= maxQuantity
        }
        return true
      },
      {
        message:
          'Total receiver quantities cannot exceed the gift card quantity',
        path: ['receivers'],
      },
    )

export const giftCardCheckoutSchema = createGiftCardCheckoutSchema()

export type TCreateGiftCardSchema = z.infer<typeof createGiftCardSchema>
export type TUpdateGiftCardSchema = z.infer<typeof updateGiftCardSchema>
export type TReceiverSchema = z.infer<typeof receiverSchema>
export type TGiftCardCheckoutSchema = z.infer<
  ReturnType<typeof createGiftCardCheckoutSchema>
>
