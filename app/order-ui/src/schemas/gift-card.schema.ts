import { z } from 'zod'
import { GiftCardType } from '@/constants'
import { TFunction } from 'i18next';

const titleSchema = (t: TFunction) => z
  .string({ message: t("schema.title.required") })
  .trim()
  .min(1, t("schema.title.min"))
  .max(500, t('schema.title.max'));

const descriptionSchema = (t: TFunction) => z
  .string()
  .trim()
  .max(1000, t('schema.description.max'))
  .optional();

export const receiverSchema = z.object({
  recipientSlug: z.string().min(10),
  name: z.string(),
  quantity: z.coerce.number().min(1).max(100),
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

export type TReceiverSchema = z.infer<typeof receiverSchema>
export type TGiftCardCheckoutSchema = z.infer<
  ReturnType<typeof createGiftCardCheckoutSchema>
>

const fileSchema = z
  .instanceof(File)
  .optional();

const pointsSchema = (t: TFunction) => z.coerce
  .number({
    required_error: t('schema.points.required'),
    invalid_type_error: t('schema.points.invalid'),
  })
  .min(1000, t('schema.points.min'))
  .max(10_000_000, t('schema.points.max'));

const priceSchema = (t: TFunction) => z.coerce
  .number({
    required_error: t('schema.price.required'),
    invalid_type_error: t('schema.price.invalid'),
  })
  .min(1000, t('schema.price.min'))
  .max(10_000_000, t('schema.price.max'));

const isActiveSchema = z.boolean().default(true);

// Create Schema
export const createGiftCardSchema = (t: TFunction) => z.object({
  title: titleSchema(t),
  description: descriptionSchema(t),
  file: fileSchema,
  points: pointsSchema(t),
  price: priceSchema(t),
  isActive: isActiveSchema,
});

// Update Schema
export const updateGiftCardSchema = (t: TFunction) => createGiftCardSchema(t).extend({
  slug: z
    .string()
    .min(1),
});


export type TCreateGiftCardSchema = z.infer<ReturnType<typeof createGiftCardSchema>>
export type TUpdateGiftCardSchema = z.infer<ReturnType<typeof updateGiftCardSchema>>
