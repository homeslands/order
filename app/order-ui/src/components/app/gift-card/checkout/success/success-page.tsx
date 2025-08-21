import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { OrderSuccess } from '@/assets/images'
import { Button } from '@/components/ui'
import { Role, ROUTE } from '@/constants'
import { useUserStore } from '@/stores'

export default function GiftCardSuccessPage() {
  const { t } = useTranslation(['giftCard', 'common'])
  const navigate = useNavigate()
  const { userInfo } = useUserStore()
  const role = userInfo?.role?.name
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const timer = setTimeout(() => {}, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleBackToGiftCard = () => {
    if (role === Role.CUSTOMER) {
      navigate(ROUTE.CLIENT_GIFT_CARD)
    } else {
      navigate(ROUTE.STAFF_GIFT_CARD_MENU)
    }
  }

  return (
    <div className="flex h-[calc(100vh-200px)] w-full flex-col items-center justify-center gap-4">
      <img src={OrderSuccess} className="h-48 w-48 sm:object-fill" />
      <div className="text-xl font-semibold text-primary">
        {t('giftCard.purchaseSuccess', 'Gift Card Purchase Successful')}
      </div>{' '}
      <Button onClick={handleBackToGiftCard}>
        {t('giftCard.backToGiftCards')}
      </Button>
    </div>
  )
}
