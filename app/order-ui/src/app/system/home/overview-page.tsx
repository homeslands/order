import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronRight, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueSummary, RevenueChart, TopProducts, RevenueComparison } from './components'
// import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'
import { ROUTE } from '@/constants'

export default function OverviewPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  // Get first and last day of current month as default values
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').toISOString()
  )
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('day').toISOString()
  )
  // const [branch, setBranch] = useState<string>('')

  // const handleSelectBranch = (branch: string) => {
  //   setBranch(branch)
  // }

  const handleSelectDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="min-h-screen">
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
              <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
              <NavLink to={ROUTE.OVERVIEW_DETAIL} className='flex items-center justify-between px-4 py-2 transition-all duration-300 rounded-full hover:text-primary hover:bg-primary/10'>
                <span className='text-xs'>
                  {tCommon('common.viewDetail')}
                </span>
                <ChevronRight size={18} />
              </NavLink>
            </div>
          </div>
        </span>
        <div>
          <RevenueSummary startDate={startDate} endDate={endDate} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueChart startDate={startDate} endDate={endDate} />
          {/* <BranchRevenueChart branch={branch} startDate={startDate} endDate={endDate} /> */}
          <TopProducts />
        </div>
        <RevenueComparison />
      </main>
    </div>
  )
}


