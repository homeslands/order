import { useState } from 'react'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueSummary, RevenueChart, TopProducts, RevenueComparison } from './components'
import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'

export default function OverviewPage() {
  const { t } = useTranslation(['dashboard'])
  // Get first and last day of current month as default values
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').toISOString()
  )
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('day').toISOString()
  )

  const handleSelectBranch = (branch: string) => {
    console.log(branch)
  }

  const handleSelectDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="min-h-screen">
      <main className='flex flex-col gap-2 pb-4'>
        <span className="flex items-center justify-between w-full gap-1 text-lg">
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-1'>
              <SquareMenu />
              {t('dashboard.title')}
            </div>
            <span className='px-4 py-1 text-xs border rounded-full border-primary text-primary bg-primary/10'>
              {startDate && moment(startDate).format('DD/MM/YYYY')} - {endDate && moment(endDate).format('DD/MM/YYYY')}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <BranchSelect onChange={handleSelectBranch} />
            <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
          </div>
        </span>
        <RevenueSummary startDate={startDate} endDate={endDate} />
        <div className="grid grid-cols-1 gap-2">
          <RevenueChart startDate={startDate} endDate={endDate} />
          <TopProducts />
        </div>
        <RevenueComparison />
      </main>
    </div>
  )
}


