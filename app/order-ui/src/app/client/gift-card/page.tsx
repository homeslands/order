import { GiftCardPage } from '@/components/app/gift-card'
import { useTranslation } from 'react-i18next'

export default function ClientGiftCardPage() {
  const { t } = useTranslation('helmet')
  return (
    <GiftCardPage
      helmet={{
        title: t('helmet.giftCard.title'),
        description: t('helmet.giftCard.description'),
      }}
    />
  )
}
