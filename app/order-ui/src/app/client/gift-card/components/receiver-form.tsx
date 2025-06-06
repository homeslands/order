import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Control } from 'react-hook-form'
import {
  Button,
  Input,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui'
import RecipientSearchInput from './recipient-search-input'
import { type TGiftCardCheckoutSchema } from '@/schemas'

interface ReceiverFormProps {
  index: number
  canRemove: boolean
  onRemove: () => void
  control: Control<TGiftCardCheckoutSchema>
}

export default function ReceiverForm({
  index,
  canRemove,
  onRemove,
  control,
}: ReceiverFormProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('giftCard.receiver')} {index + 1}
        </h3>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <FormField
        control={control}
        name={`receivers.${index}.recipientSlug`}
        render={({ field }) => (
          <FormItem className="mt-2">
            <FormLabel>
              {t('giftCard.receiverPhone')}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RecipientSearchInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('giftCard.enterReceiverPhone')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`receivers.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('giftCard.quantity')}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                placeholder={t('giftCard.enterQuantity')}
                min="1"
                max="100"
                onChange={(e) => {
                  const value = e.target.value
                  // Convert to number immediately, if empty or invalid, use 0
                  const numValue = value === '' ? 0 : parseInt(value) || 0
                  field.onChange(numValue)
                }}
                value={field.value?.toString() || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`receivers.${index}.message`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('giftCard.note')}</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('giftCard.enterNote')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
