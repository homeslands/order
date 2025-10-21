import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { ShieldCheckIcon } from 'lucide-react'
import { useCoinPolicies } from '@/hooks/use-coin-policies'
import CoinPolicyItem from './components/coin-policy-item'


export default function CoinPolicyPage() {
  const { t } = useTranslation(['coinPolicy'])
  const { t: tHelmet } = useTranslation('helmet')

  const { data } = useCoinPolicies()

  const coinPolicies = data?.result || [];

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.coinPolicy.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.coinPolicy.title')} />
      </Helmet>

      <div className={`transition-all duration-300 ease-in-out`}>
        {/* Title */}
        <div className="flex items-center gap-1">
          <ShieldCheckIcon />
          {t('coinPolicy.title')}
        </div>
        {/* Content */}
        {coinPolicies?.length > 0 ? (
          <div className="grid w-full gap-2">
            {coinPolicies.map((config) => (
              <CoinPolicyItem key={config.slug} data={config} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            {t('coinPolicy.noData')}
          </p>
        )}
      </div>
    </>
  )
}
