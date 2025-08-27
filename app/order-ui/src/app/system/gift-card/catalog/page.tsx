import { useTranslation } from 'react-i18next'
import { GiftCardPage } from '@/components/app/gift-card'

export default function GiftCardMenuPage() {
  const { t: tHelmet } = useTranslation('helmet')

  return (
    <div className="grid h-full grid-cols-1 gap-2">
      <GiftCardPage
        helmet={{
          title: tHelmet('helmet.giftCardMenu.title'),
          description: tHelmet('helmet.giftCardMenu.description'),
        }}
      />
    </div>
  )
}
