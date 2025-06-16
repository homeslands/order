import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Control, useForm, FieldArrayWithId } from 'react-hook-form'
import { Button } from '@/components/ui'
import ReceiverForm from './receiver-form'
import { type TGiftCardCheckoutSchema, type TReceiverSchema } from '@/schemas'

interface ReceiversSectionProps {
  control: Control<TGiftCardCheckoutSchema>
  fields: FieldArrayWithId<TGiftCardCheckoutSchema, 'receivers', 'id'>[]
  append: (value: TReceiverSchema) => void
  remove: (index: number) => void
  quantity: number
  form: ReturnType<typeof useForm<TGiftCardCheckoutSchema>>
}

export default function ReceiversSection({
  control,
  fields,
  append,
  remove,
  quantity,
  form,
}: ReceiversSectionProps) {
  const { t } = useTranslation(['giftCard'])

  // Watch receivers to get current values
  const receivers = form.watch('receivers') || []

  // Calculate total receiver quantities
  const totalReceiverQuantity = receivers.reduce(
    (sum: number, receiver: TReceiverSchema) =>
      sum + (Number(receiver.quantity) || 0),
    0,
  )

  return (
    <div className="mt-6 flex flex-col gap-4 overflow-hidden pb-6">
      {/* Quantity Summary */}
      <div className="rounded-lg border bg-muted p-3">
        <div className="flex items-center justify-between text-sm">
          <span>{t('giftCard.availableQuantity')}:</span>
          <span className="font-semibold">{quantity}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>{t('giftCard.totalReceiverQuantity')}:</span>
          <span
            className={`font-semibold ${totalReceiverQuantity > quantity ? 'text-destructive' : 'text-primary'}`}
          >
            {totalReceiverQuantity}
          </span>
        </div>
        {totalReceiverQuantity > quantity && (
          <div className="mt-2 text-xs text-destructive">
            {t('giftCard.quantityExceedsAvailable')}
          </div>
        )}
      </div>

      {fields.map((_, index) => (
        <ReceiverForm
          key={index}
          index={index}
          canRemove={fields.length > 1}
          onRemove={() => remove(index)}
          control={control}
        />
      ))}

      {fields.length < quantity && (
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() =>
            append({ recipientSlug: '', quantity: 1, message: '' })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('giftCard.addReceiver')}
        </Button>
      )}
    </div>
  )
}
