import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Control, useForm, FieldArrayWithId } from 'react-hook-form'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import ReceiverForm from './receiver-form'
import { type TGiftCardCheckoutSchema, type TReceiverSchema } from '@/schemas'

interface ReceiversSectionProps {
  control: Control<TGiftCardCheckoutSchema>
  fields: FieldArrayWithId<TGiftCardCheckoutSchema, 'receivers', 'id'>[]
  append: (value: TReceiverSchema) => void
  remove: (index: number) => void
  form: ReturnType<typeof useForm<TGiftCardCheckoutSchema>>
  onQuantityChange?: (newQuantity: number) => void
}

export default function ReceiversSection({
  control,
  fields,
  append,
  remove,
  form,
  onQuantityChange,
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
  // Auto-update quantity in form when receivers change
  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(totalReceiverQuantity)
    }
  }, [totalReceiverQuantity, onQuantityChange])

  return (
    <div className="mt-6 flex flex-col gap-4 overflow-hidden pb-6">
      {receivers.length > 0 && (
        <>
          {fields.map((field, index) => (
            <ReceiverForm
              key={field.id}
              index={index}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              control={control}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() =>
              append({ recipientSlug: '', quantity: 1, message: '', name: '' })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('giftCard.addReceiver')}
          </Button>
        </>
      )}
    </div>
  )
}
