import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { ChevronRight, RefreshCcw, SquareMenu } from 'lucide-react'

import { RevenueSummary, RevenueChart, TopProducts, RevenueComparison } from './components'
import { TimeRangeRevenueFilter } from '@/components/app/popover'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { useLatestRevenue } from '@/hooks'

export default function OverviewPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tHelmet } = useTranslation('helmet')
  const [trigger, setTrigger] = useState(0)
  // Get first and last day of current month as default values
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').toISOString()
  )
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('day').toISOString()
  )
  const { mutate: refreshRevenue } = useLatestRevenue()

  const handleSelectDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleRefreshRevenue = () => {
    refreshRevenue()
    setTrigger(prev => prev + 1) // Increment trigger to cause refresh
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.home.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.home.title')} />
      </Helmet>
      <main className='flex flex-col gap-2 pb-4'>
        <span className="flex items-center justify-between w-full gap-1 pb-4 text-lg">
          <div className='flex flex-col items-center w-full gap-2 sm:justify-between sm:flex-row'>
            <div className='flex items-center justify-start w-full gap-1 px-1 sm:w-fit'>
              <SquareMenu />
              {t('dashboard.title')}
              <span className='px-4 py-1 ml-4 text-xs border rounded-full border-primary text-primary bg-primary/10'>
                {startDate && moment(startDate).format('DD/MM/YYYY')} - {endDate && moment(endDate).format('DD/MM/YYYY')}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              {/* <BranchSelect onChange={handleSelectBranch} /> */}
              <Button variant="outline" onClick={handleRefreshRevenue} className='flex items-center gap-1'>
                <RefreshCcw />
                {tCommon('common.refresh')}
              </Button>
              <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
              <NavLink to={ROUTE.OVERVIEW_DETAIL} className='flex items-center justify-between transition-all duration-300 rounded-full hover:text-primary hover:bg-primary/10'>
                <Button
                  variant='outline'
                >
                  {tCommon('common.viewDetail')}
                  <ChevronRight size={18} />
                </Button>
              </NavLink>
            </div>
          </div>
        </span>
        <div>
          <RevenueSummary startDate={startDate} endDate={endDate} trigger={trigger} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueChart trigger={trigger} startDate={startDate} endDate={endDate} />
          <TopProducts />
        </div>
        <RevenueComparison trigger={trigger} />
      </main>
    </div>
  )
}


