import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Gift } from 'lucide-react'

import { SystemCardOrderHistoryTabs } from '@/components/app/tabs/system-card-order-history.tabs'

export interface IFilterProps {
  startDate?: string;
  endDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any;
}

export default function CardOrderHistoryPage() {
  const { t } = useTranslation(['giftCard'])
  const { t: tHelmet } = useTranslation('helmet')

  return (
    <div className="grid grid-cols-1 gap-2 h-full">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.cardOrder.title')}</title>
        <meta name="description" content={tHelmet('helmet.cardOrder.title')} />
      </Helmet>
      <span className="flex gap-1 justify-between items-center pt-1 text-lg text-gray-900 dark:text-white">
        <div className="flex gap-2 items-center">
          <Gift className="text-gray-700 dark:text-gray-300" />
          {t('giftCard.cardOrder.title')}
        </div>
      </span>
      {/* Content */}
      <SystemCardOrderHistoryTabs />
    </div>
  )
}
