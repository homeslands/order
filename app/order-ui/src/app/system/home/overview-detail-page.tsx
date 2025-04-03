import { useCallback, useEffect, useState } from 'react'
import { RefreshCcw, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueDetailChart, TopProductsDetail, RevenueDetailComparison, RevenueDetailSummary, RevenueTable } from './components'
import { BranchSelect } from '@/components/app/select'
import { TimeRangeRevenueFilter } from '@/components/app/popover'
import { Button } from '@/components/ui'
import { useLatestRevenue } from '@/hooks'
import { showToast } from '@/utils'
import { useUserStore } from '@/stores'

export default function OverviewDetailPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const [trigger, setTrigger] = useState(0)
  const { userInfo } = useUserStore()
  const [startDate, setStartDate] = useState<string>(moment().toISOString())
  const [endDate, setEndDate] = useState<string>(moment().toISOString())
  const [branch, setBranch] = useState<string>('')
  const { mutate: refreshRevenue } = useLatestRevenue()

  useEffect(() => {
    if (userInfo?.branch.slug) {
      setBranch(userInfo?.branch.slug)
    }
  }, [userInfo])

  const handleRefreshRevenue = useCallback(() => {
    refreshRevenue(undefined, {
      onSuccess: () => {
        showToast(tToast('toast.refreshRevenueSuccess'))
        setTrigger(prev => prev + 1) // Increment trigger to cause refresh
      }
    })
  }, [refreshRevenue, tToast])

  useEffect(() => {
    handleRefreshRevenue()
  }, [startDate, endDate, branch, handleRefreshRevenue])


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
        <span className="flex gap-1 justify-between items-center pb-4 w-full text-lg">
          <div className='flex flex-col gap-2 items-center w-full sm:justify-between sm:flex-row'>
            <div className='flex gap-1 justify-start items-center px-1 w-full sm:w-fit'>
              <SquareMenu />
              {t('dashboard.titleDetail')}
              <span className='px-4 py-1 ml-4 text-xs rounded-full border border-primary text-primary bg-primary/10'>
                {startDate === endDate ? moment(startDate).format('DD/MM/YYYY') : `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`}
              </span>
            </div>

            <div className='flex gap-2 items-center'>
              <Button variant="outline" onClick={handleRefreshRevenue} className='flex gap-1 items-center'>
                <RefreshCcw />
                {tCommon('common.refresh')}
              </Button>
              <div className='w-[14rem]'>
                <BranchSelect defaultValue={branch} onChange={handleSelectBranch} />
              </div>
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
        <RevenueTable branch={branch} key={trigger} />
      </main>
    </div>
  )
}


