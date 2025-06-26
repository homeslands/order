import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Control, useForm, FieldArrayWithId } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
  onRecipientsSelectionChange?: (hasSelectedRecipients: boolean) => void
}

export default function ReceiversSection({
  control,
  fields,
  append,
  remove,
  form,
  onQuantityChange,
  onRecipientsSelectionChange,
}: ReceiversSectionProps) {
  const { t } = useTranslation(['giftCard'])
  const receivers = form.watch('receivers') || []
  const [selectedRecipients, setSelectedRecipients] = useState<
    Record<number, boolean>
  >({})

  // Calculate total receiver quantities
  const totalReceiverQuantity = receivers.reduce(
    (sum: number, receiver: TReceiverSchema) =>
      sum + (Number(receiver.quantity) || 0),
    0,
  )

  // Handle recipient selection changes
  const handleRecipientSelectionChange = (
    index: number,
    hasSelectedUser: boolean,
  ) => {
    setSelectedRecipients((prev) => {
      const updated = { ...prev, [index]: hasSelectedUser }
      return updated
    })
  }

  // Notify parent component when recipient selection status changes
  useEffect(() => {
    if (onRecipientsSelectionChange && receivers.length > 0) {
      // Check if all recipients have selected users
      const allSelected =
        Object.keys(selectedRecipients).length === receivers.length &&
        Object.values(selectedRecipients).every(Boolean)
      onRecipientsSelectionChange(allSelected)
    }
  }, [selectedRecipients, receivers.length, onRecipientsSelectionChange])

  // Reset the selection state when fields change dramatically
  useEffect(() => {
    // If there are no receivers or if the field count doesn't match selection count
    // Create a fresh selection state object
    if (fields.length === 0) {
      setSelectedRecipients({})
    } else if (Object.keys(selectedRecipients).length !== fields.length) {
      const freshSelections: Record<number, boolean> = {}

      // Initialize with existing values where possible
      fields.forEach((_, index) => {
        freshSelections[index] = selectedRecipients[index] || false
      })

      setSelectedRecipients(freshSelections)
    }
  }, [fields, fields.length, selectedRecipients])

  // Auto-update quantity in form when receivers change
  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(totalReceiverQuantity)
    }
  }, [totalReceiverQuantity, onQuantityChange])

  // Custom remove function that also updates selectedRecipients
  const handleReceiverRemove = (indexToRemove: number) => {
    // First update the selection state by shifting indices
    setSelectedRecipients((prev) => {
      const updated: Record<number, boolean> = {}

      // Rebuild the selection state with adjusted indices
      Object.keys(prev).forEach((indexKey) => {
        const index = parseInt(indexKey)
        if (index < indexToRemove) {
          // Indices before the removed one stay the same
          updated[index] = prev[index]
        } else if (index > indexToRemove) {
          // Indices after the removed one shift down by 1
          updated[index - 1] = prev[index]
        }
        // The removed index is excluded
      })

      return updated
    })

    // Then remove the receiver using the original remove function
    remove(indexToRemove)
  }

  return (
    <div className="mt-6 flex flex-col gap-4 overflow-hidden pb-6">
      {receivers.length > 0 && (
        <>
          {fields.map((field, index) => (
            <ReceiverForm
              key={field.id}
              index={index}
              canRemove={fields.length > 1}
              onRemove={() => handleReceiverRemove(index)}
              control={control}
              onRecipientSelectionChange={handleRecipientSelectionChange}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => {
              append({ recipientSlug: '', quantity: 1, message: '' })
              const newIndex = receivers.length
              setSelectedRecipients((prev) => ({ ...prev, [newIndex]: false }))
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('giftCard.addReceiver')}
          </Button>
        </>
      )}
    </div>
  )
}
