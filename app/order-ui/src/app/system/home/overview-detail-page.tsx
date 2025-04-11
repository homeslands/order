import { useCallback, useEffect, useState } from 'react'
import { CircleX, RefreshCcw, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueDetailChart, TopProductsDetail, RevenueDetailSummary, RevenueTable } from './components'
import { BranchSelect } from '@/components/app/select'
import { ExportRevenuePopover } from '@/components/app/popover'
import { Badge, Button } from '@/components/ui'
import { useBranchRevenue, useLatestRevenue } from '@/hooks'
import { showToast } from '@/utils'
import { useBranchStore } from '@/stores'
import { RevenueTypeQuery } from '@/constants'
import { IRevenueQuery } from '@/types'
import { RevenueToolDropdown } from '@/components/app/dropdown'

export default function OverviewDetailPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const { branch } = useBranchStore()
  const [startDate, setStartDate] = useState<string>(moment().toISOString())
  const [endDate, setEndDate] = useState<string>(moment().toISOString())
  const [revenueType, setRevenueType] = useState<RevenueTypeQuery>(RevenueTypeQuery.DAILY)
  const { mutate: refreshRevenue } = useLatestRevenue()

  const { data, isLoading, refetch: refetchRevenue } = useBranchRevenue({
    branch: branch?.slug || '',
    startDate,
    endDate,
    type: revenueType,
  })

  const revenueData = data?.result

  // adjust date in revenueData to be in format YYYY-MM-DD, based on revenueType
  const adjustedRevenueData = revenueData?.map(item => ({
    ...item,
    date: revenueType === RevenueTypeQuery.DAILY ? moment(item.date).format('YYYY-MM-DD') : moment(item.date).format('YYYY-MM-DD HH:mm')
  }))

  const handleRefreshRevenue = useCallback(() => {
    refreshRevenue(undefined, {
      onSuccess: () => {
        showToast(tToast('toast.refreshRevenueSuccess'))
        refetchRevenue()
      }
    })
  }, [refreshRevenue, tToast, refetchRevenue])

  useEffect(() => {
    handleRefreshRevenue()
  }, [startDate, endDate, branch, handleRefreshRevenue])

  const handleSelectDateRange = (data: IRevenueQuery) => {
    setStartDate(data.startDate || '')
    setEndDate(data.endDate || '')
    setRevenueType(data.type || RevenueTypeQuery.DAILY)
  }

  return (
    <div className="min-h-screen">
      <main className='flex flex-col gap-2 pb-4'>
        <div className='flex flex-col gap-2 items-center pt-1 w-full sm:justify-between sm:flex-row'>
          <div className='flex gap-3 justify-start items-center px-1 w-full sm:w-fit'>
            <div className='flex gap-1 items-center'>
              <SquareMenu />
              {t('dashboard.title')}
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <RevenueToolDropdown branch={branch?.slug || ''} startDate={startDate} endDate={endDate} revenueType={revenueType} />
            <Button variant="outline" onClick={handleRefreshRevenue} className='flex gap-1 items-center'>
              <RefreshCcw />
              {tCommon('common.refresh')}
            </Button>
            <ExportRevenuePopover onApply={handleSelectDateRange} />
            <div className='w-[14rem]'>
              <BranchSelect defaultValue={branch?.slug} />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex gap-4 items-center w-full'>
            {startDate && endDate && revenueType && (
              <div className='flex gap-2 items-center'>
                <span className='text-sm text-muted-foreground'>{t('dashboard.filter')}</span>
                <Badge className='flex gap-1 items-center h-8 text-sm border-primary text-primary bg-primary/10' variant='outline'>
                  {startDate === endDate ? moment(startDate).format('DD/MM/YYYY') : `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`}
                  <span className='cursor-pointer' onClick={() => {
                    setStartDate(moment().format('YYYY-MM-DD'))
                    setEndDate(moment().format('YYYY-MM-DD'))
                  }}>
                    <CircleX className='w-4 h-4' />
                  </span>
                </Badge>
                <Badge className='flex gap-1 items-center h-8 text-sm border-primary text-primary bg-primary/10' variant='outline'>
                  {revenueType === RevenueTypeQuery.DAILY ? t('dashboard.daily') : t('dashboard.hourly')}
                  <span className='cursor-pointer' onClick={() => setRevenueType(RevenueTypeQuery.DAILY)}>
                    <CircleX className='w-4 h-4' />
                  </span>
                </Badge>
              </div>
            )}
          </div>
          <RevenueDetailSummary revenueData={adjustedRevenueData} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueDetailChart revenueType={revenueType} revenueData={adjustedRevenueData} />
          <TopProductsDetail />
        </div>
        <RevenueTable revenueData={adjustedRevenueData} isLoading={isLoading} />
      </main>
    </div>
  )
}


