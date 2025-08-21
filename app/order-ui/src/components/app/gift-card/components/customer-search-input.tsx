import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui'
import RecipientSearchInput from './recipient-search-input'
import { type IUserInfo } from '@/types'
import { useUserStore } from '@/stores'
import { Role } from '@/constants'

interface CustomerSearchInputProps {
  setCustomerSlug: (slug: string) => void
  onCustomerSelectionChange: (hasSelectedRecipients: boolean) => void
}

export default function CustomerSearchInput({
  setCustomerSlug,
  onCustomerSelectionChange,
}: CustomerSearchInputProps) {
  const { t } = useTranslation(['giftCard'])
  const { userInfo } = useUserStore()
  const role = userInfo?.role.name
  const { setValue, watch } = useFormContext()

  // Watch userInfo for this receiver
  const receiverUserInfo = watch(`customer.userInfo`)

  // Auto-fill name logic when user is selected from search
  const handleUserSelect = (user: IUserInfo | null) => {
    if (user) {
      // Handle cases where firstName or lastName might be null/undefined
      const firstName = user.firstName || ''
      const lastName = user.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()

      // Set the name
      setValue(`customer.name`, fullName || t('giftCard.noName'))

      // Save the complete userInfo for future reference
      setValue(`customer.userInfo`, user)

      setCustomerSlug(user.slug)
    } else {
      setValue(`customer.name`, '')
      setValue(`customer.userInfo`, undefined)
    }
  }
  const getReceiverTexts = () => {
    if (role === Role.CUSTOMER) {
      return {
        title: t('giftCard.receiver'),
        phone: t('giftCard.receiverPhone'),
        enterPhone: t('giftCard.enterReceiverPhone'),
        name: t('giftCard.receiverName'),
      }
    }

    return {
      title: t('giftCard.customer.title'),
      phone: t('giftCard.customer.customerPhone'),
      enterPhone: t('giftCard.customer.enterPhone'),
      name: t('giftCard.customer.customerName'),
    }
  }
  const labels = getReceiverTexts()

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{labels.title}</h3>
      </div>
      <FormField
        name={`customer.recipientSlug`}
        render={({ field }) => (
          <FormItem className="mt-2">
            <FormLabel>
              {labels.phone}
              <span className="text-destructive dark:text-red-400">*</span>
            </FormLabel>
            <FormControl>
              <RecipientSearchInput
                value={field.value}
                onChange={field.onChange}
                onUserSelect={handleUserSelect}
                placeholder={labels.enterPhone}
                onSelectionChange={onCustomerSelectionChange}
                userInfo={receiverUserInfo}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name={`customer.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {labels.name}
              <span className="text-destructive dark:text-red-400">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder={labels.name} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
