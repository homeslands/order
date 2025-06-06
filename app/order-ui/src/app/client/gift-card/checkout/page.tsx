import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'
import { Gift, ShoppingCart } from 'lucide-react'

export default function GiftCardCheckoutPage() {
  const { t } = useTranslation(['giftCard', 'common'])

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{t('giftCard.checkoutTitle') || 'Gift Card Checkout'}</title>
        <meta
          name="description"
          content={
            t('giftCard.checkoutDescription') ||
            'Complete your gift card purchase'
          }
        />
      </Helmet>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t('giftCard.checkout') || 'Gift Card Checkout'}
          </h1>
          <p className="text-gray-600">
            {t('giftCard.checkoutDescription') ||
              'Complete your gift card purchase'}
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="py-20 text-center">
            <Gift className="mx-auto mb-6 h-24 w-24 text-gray-300" />
            <h2 className="mb-4 text-2xl font-semibold text-gray-500">
              {t('giftCard.checkoutPageComingSoon') ||
                'Checkout Page Coming Soon'}
            </h2>
            <p className="mx-auto max-w-md text-gray-400">
              {t('giftCard.checkoutPageDescription') ||
                'This checkout page is currently under development. You can complete your gift card purchase through the gift card cart.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
