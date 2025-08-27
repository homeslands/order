import { useCallback, useState } from 'react'
import { RefreshCcw, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { RevenueDetailChart, TopProductsDetail, RevenueDetailSummary, RevenueTable } from './components'
import { BranchSelect } from '@/components/app/select'
import { RevenueFilterPopover } from '@/components/app/popover'
import { Badge, Button } from '@/components/ui'
import { useBranchRevenue, useLatestRevenue, useRefreshProductAnalysis, useTopBranchProducts } from '@/hooks'
import { showToast } from '@/utils'
import { useBranchStore } from '@/stores'
import { RevenueTypeQuery } from '@/constants'
import { IRefreshProductAnalysisRequest, IRevenueQuery } from '@/types'
import { RevenueToolDropdown } from '@/components/app/dropdown'

export default function OverviewDetailPage() {
  const { t } = useTranslation(['dashboard'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const { branch } = useBranchStore()
  // const { overviewFilter, setOverviewFilter, clearOverviewFilter } = useOverviewFilterStore()
  const [startDate, setStartDate] = useState<string>(moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'))
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD HH:mm:ss'))
  const [type, setType] = useState<RevenueTypeQuery>(RevenueTypeQuery.DAILY)
  const { mutate: refreshRevenue } = useLatestRevenue()
  const { mutate: refreshProductAnalysis } = useRefreshProductAnalysis()

  const { data, isLoading, refetch: refetchRevenue } = useBranchRevenue({
    branch: branch?.slug || '',
    startDate: startDate,
    endDate: endDate,
    type: type,
  })

  const { data: topBranchProducts } = useTopBranchProducts({
    branch: branch?.slug || '',
    hasPaging: false,
    startDate: startDate,
    endDate: endDate,
    type: type
  })

  const revenueData = data?.result
  const topProducts = topBranchProducts?.result.items

  // adjust date in revenueData to be in format YYYY-MM-DD, based on revenueType
  const adjustedRevenueData = revenueData?.map(item => ({
    ...item,
    date: type === RevenueTypeQuery.DAILY ? moment(item.date).format('YYYY-MM-DD') : moment(item.date).format('YYYY-MM-DD HH:mm')
  }))

  const referenceNumbers = adjustedRevenueData?.flatMap(item => [
    item.maxReferenceNumberOrder,
    item.minReferenceNumberOrder,
  ]).filter(num => num !== 0)

  const maxReferenceNumberOrder = referenceNumbers?.length ? Math.max(...referenceNumbers) : null
  const minReferenceNumberOrder = referenceNumbers?.length ? Math.min(...referenceNumbers) : null

  const handleRefreshRevenue = useCallback(() => {
    const refreshProductAnalysisParams: IRefreshProductAnalysisRequest = {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    }
    refreshRevenue(undefined, {
      onSuccess: () => {
        showToast(tToast('toast.refreshRevenueSuccess'))
        refetchRevenue()
      }
    })
    refreshProductAnalysis(refreshProductAnalysisParams, {
      onSuccess: () => {
        showToast(tToast('toast.refreshProductAnalysisSuccess'))
      }
    })
  }, [refreshRevenue, tToast, refetchRevenue, refreshProductAnalysis, startDate, endDate])

  const handleSelectDateRange = (data: IRevenueQuery) => {
    const newStartDate = data.startDate
      ? moment(data.startDate).format('YYYY-MM-DD HH:mm:ss')
      : '';

    const newEndDate = data.endDate
      ? moment(data.endDate).format('YYYY-MM-DD HH:mm:ss')
      : '';
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setType(data.type || RevenueTypeQuery.DAILY)
  };

  return (
    <div className="min-h-screen">
      <main className='flex flex-col gap-2 pb-4'>
        <div className='grid grid-cols-1 gap-2 items-center pt-1 w-full sm:justify-between sm:grid-cols-5'>
          <div className='flex col-span-1 gap-3 justify-start items-center px-1 w-full sm:w-fit'>
            <div className='flex gap-1 items-center'>
              <SquareMenu />
              {t('dashboard.title')}
            </div>
          </div>
          <div className='flex overflow-x-auto col-span-4 gap-2 justify-end items-center px-2 whitespace-nowrap sm:max-w-full'>
            <div className="flex-shrink-0">
              <RevenueToolDropdown branch={branch?.slug || ''} startDate={startDate} endDate={endDate} revenueType={type} />
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshRevenue}
              className="flex flex-shrink-0 gap-1 items-center"
            >
              <RefreshCcw />
              {tCommon('common.refresh')}
            </Button>
            <div className="flex-shrink-0">
              <RevenueFilterPopover onApply={handleSelectDateRange} />
            </div>
            <BranchSelect defaultValue={branch?.slug} />
          </div>
        </div>
        <div className='flex overflow-x-auto gap-2 items-center px-2 max-w-sm whitespace-nowrap sm:max-w-full'>
          {startDate && endDate && type && (
            <div className='flex gap-2 items-center'>
              <span className='text-sm text-muted-foreground'>{t('dashboard.filter')}</span>
              <Badge className='flex gap-1 items-center h-8 text-sm border-primary text-primary bg-primary/10' variant='outline'>
                {startDate === endDate ? moment(startDate).format('HH:mm DD/MM/YYYY') : `${moment(startDate).format('HH:mm DD/MM/YYYY')} - ${moment(endDate).format('HH:mm DD/MM/YYYY')}`}
              </Badge>
              <Badge className='flex gap-1 items-center h-8 text-sm border-primary text-primary bg-primary/10' variant='outline'>
                {type === RevenueTypeQuery.DAILY ? t('dashboard.daily') : t('dashboard.hourly')}
              </Badge>
              <Badge className='flex gap-1 items-center h-8 text-sm border-primary text-primary bg-primary/10' variant='outline'>
                {t('dashboard.referenceNumberOrder')}: {minReferenceNumberOrder} - {maxReferenceNumberOrder}
              </Badge>
            </div>
          )}
        </div>
        <div className='flex flex-col gap-4'>
          <RevenueDetailSummary revenueData={adjustedRevenueData} topProduct={topProducts} />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RevenueDetailChart revenueType={type} revenueData={adjustedRevenueData} />
          <TopProductsDetail topProducts={topProducts} />
        </div>
        <RevenueTable revenueData={adjustedRevenueData} isLoading={isLoading} />
      </main>
    </div>
  )
}


