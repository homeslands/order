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
  // const [startDate, setStartDate] = useState<string>(
  //   moment().startOf('month').toISOString()
  // )
  // const [endDate, setEndDate] = useState<string>(
  //   moment().endOf('day').toISOString()
  // )
  // Set default values to today's date
  const [startDate, setStartDate] = useState<string>(moment().toISOString())
  const [endDate, setEndDate] = useState<string>(moment().toISOString())
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
        <span className="flex gap-1 justify-between items-center pb-4 w-full text-lg">
          <div className='flex flex-col gap-2 items-center w-full sm:justify-between sm:flex-row'>
            <div className='flex gap-1 justify-start items-center px-1 w-full sm:w-fit'>
              <SquareMenu />
              {t('dashboard.title')}
              <span className='px-4 py-1 ml-4 text-xs rounded-full border border-primary text-primary bg-primary/10'>
                {startDate === endDate ? moment(startDate).format('DD/MM/YYYY') : `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`}
              </span>
            </div>

            <div className='flex gap-2 items-center'>
              <Button variant="outline" onClick={handleRefreshRevenue} className='flex gap-1 items-center'>
                <RefreshCcw />
                {tCommon('common.refresh')}
              </Button>
              <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
              <NavLink to={ROUTE.OVERVIEW_DETAIL} className='flex justify-between items-center rounded-full transition-all duration-300 hover:text-primary hover:bg-primary/10'>
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


