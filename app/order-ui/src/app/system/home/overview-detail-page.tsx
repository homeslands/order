import { useState } from 'react'
import { RefreshCcw, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueDetailChart, TopProductsDetail, RevenueDetailComparison, RevenueDetailSummary } from './components'
import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'
import { Button } from '@/components/ui'
import { useLatestBranchRevenue } from '@/hooks'
import { showToast } from '@/utils'

export default function OverviewDetailPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const [trigger, setTrigger] = useState(0)
  // Get first and last day of current month as default values
  const [startDate, setStartDate] = useState<string>(
    moment().startOf('month').toISOString()
  )
  const [endDate, setEndDate] = useState<string>(
    moment().endOf('day').toISOString()
  )
  const [branch, setBranch] = useState<string>('')
  const { mutate: refreshBranchRevenue } = useLatestBranchRevenue()

  const handleSelectBranch = (branch: string) => {
    setBranch(branch)
  }

  const handleSelectDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleRefreshRevenue = () => {
    refreshBranchRevenue('', {
      onSuccess: () => {
        showToast(tToast('toast.refreshRevenueSuccess'))
        setTrigger(prev => prev + 1) // Increment trigger to cause refresh
      }
    })
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
              <Button variant="outline" onClick={handleRefreshRevenue} className='flex items-center gap-1'>
                <RefreshCcw />
                {tCommon('common.refresh')}
              </Button>
              <BranchSelect onChange={handleSelectBranch} />
              <TimeRangeRevenueFilter onApply={handleSelectDateRange} />
            </div>
          </div>
        </span>
        <div>
          <RevenueDetailSummary trigger={trigger} branch={branch} startDate={startDate} endDate={endDate} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueDetailChart trigger={trigger} branch={branch} startDate={startDate} endDate={endDate} />
          <TopProductsDetail branch={branch} />
        </div>
        <RevenueDetailComparison trigger={trigger} branch={branch} />
      </main>
    </div>
  )
}


