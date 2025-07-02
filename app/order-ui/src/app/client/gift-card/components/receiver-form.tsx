import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Control, useFormContext } from 'react-hook-form'
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
import { type IUserInfo } from '@/types'

interface ReceiverFormProps {
  index: number
  canRemove: boolean
  onRemove: () => void
  control: Control<TGiftCardCheckoutSchema>
  onRecipientSelectionChange?: (index: number, hasSelectedUser: boolean) => void
}

export default function ReceiverForm({
  index,
  canRemove,
  onRemove,
  control,
  onRecipientSelectionChange,
}: ReceiverFormProps) {
  const { t } = useTranslation(['giftCard'])
  const { setValue, watch } = useFormContext<TGiftCardCheckoutSchema>()

  // Watch userInfo for this receiver
  const receiverUserInfo = watch(`receivers.${index}.userInfo`)

  // Auto-fill name logic when user is selected from search
  const handleUserSelect = (user: IUserInfo | null) => {
    if (user) {
      // Handle cases where firstName or lastName might be null/undefined
      const firstName = user.firstName || ''
      const lastName = user.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()

      // Set the name
      setValue(`receivers.${index}.name`, fullName || t('giftCard.noName'))

      // Save the complete userInfo for future reference
      setValue(`receivers.${index}.userInfo`, user)
    } else {
      setValue(`receivers.${index}.name`, '')
      setValue(`receivers.${index}.userInfo`, undefined)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('giftCard.receiver')} {index + 1}
        </h3>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300"
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
              <span className="text-destructive dark:text-red-400">*</span>
            </FormLabel>
            <FormControl>
              <RecipientSearchInput
                value={field.value}
                onChange={field.onChange}
                onUserSelect={handleUserSelect}
                placeholder={t('giftCard.enterReceiverPhone')}
                onSelectionChange={(hasSelectedUser) =>
                  onRecipientSelectionChange?.(index, hasSelectedUser)
                }
                userInfo={receiverUserInfo}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`receivers.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('giftCard.receiverName')}
              <span className="text-destructive dark:text-red-400">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('giftCard.receiverName')}
                disabled
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
              <span className="text-destructive dark:text-red-400">*</span>
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
