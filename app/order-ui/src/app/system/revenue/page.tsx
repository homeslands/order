import { useState } from 'react'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  RevenueSummary,
  RevenueChart,
  TopProducts,
  RevenueComparison,
} from './components'
import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'

export default function RevenuePage() {
  const { t } = useTranslation(['revenue'])

  // Set default values to today's date
  const [startDate, setStartDate] = useState<string>(moment().toISOString())
  const [endDate, setEndDate] = useState<string>(moment().toISOString())

  const handleSelectBranch = (_branch: string) => { }

  const handleSelectDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="min-h-screen">
      <main className="flex flex-col gap-2 pb-4">
        <span className="flex gap-1 justify-between items-center w-full text-lg">
          <div className="flex gap-6 items-center">
            <div className="flex gap-1 items-center">
              <SquareMenu />
              {t('revenue.title')}
            </div>
            <span className="px-4 py-1 text-xs rounded-full border border-primary bg-primary/10 text-primary">
              {startDate && moment(startDate).format('DD/MM/YYYY')} -{' '}
              {endDate && moment(endDate).format('DD/MM/YYYY')}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <BranchSelect onChange={handleSelectBranch} />
            <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
          </div>
        </span>
        <RevenueSummary startDate={startDate} endDate={endDate} />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <RevenueChart startDate={startDate} endDate={endDate} />
          <TopProducts />
        </div>
        <RevenueComparison />
      </main>
    </div>
  )
}
