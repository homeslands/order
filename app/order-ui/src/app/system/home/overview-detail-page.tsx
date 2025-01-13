import { useState } from 'react'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueDetailChart, TopProductsDetail, RevenueDetailComparison, RevenueDetailSummary } from './components'
import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'

export default function OverviewDetailPage() {
  const { t } = useTranslation(['dashboard'])
  // Get first and last day of current month as default values
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').toISOString()
  )
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('day').toISOString()
  )
  const [branch, setBranch] = useState<string>('')

  const handleSelectBranch = (branch: string) => {
    setBranch(branch)
  }

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
              {t('dashboard.titleDetail')}
              <span className='px-4 py-1 ml-4 text-xs border rounded-full border-primary text-primary bg-primary/10'>
                {startDate && moment(startDate).format('DD/MM/YYYY')} - {endDate && moment(endDate).format('DD/MM/YYYY')}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <BranchSelect onChange={handleSelectBranch} />
              <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
            </div>
          </div>
        </span>
        <div>
          <RevenueDetailSummary branch={branch} startDate={startDate} endDate={endDate} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueDetailChart branch={branch} startDate={startDate} endDate={endDate} />
          <TopProductsDetail branch={branch} />
        </div>
        <RevenueDetailComparison branch={branch} />
      </main>
    </div>
  )
}


