import { useEffect, useState } from 'react'
import moment from 'moment'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  Tag,
} from 'lucide-react'

import {
  Card, CardContent, DataTable,
  Label,
} from '@/components/ui'

import { useIsMobile, useLoyaltyPointHistory, useLoyaltyPoints, usePagination } from '@/hooks'
import { formatPoints } from '@/utils'
import { useUserStore } from '@/stores'
import { useLoyaltyPointTransactionColumns } from '@/app/client/profile/DataTable/columns'
import { LoyaltyPointAction } from '@/app/client/profile/DataTable/actions'
import { LoyaltyPointHistoryType } from '@/constants'
import { PointConversionRule } from '../card'
import { ILoyaltyPointHistory } from '@/types'
import { LoyaltyPointDetailHistoryDialog } from '../dialog'

export function CustomerLoyaltyPointTabsContent() {
  const { t } = useTranslation(['profile'])
  const { t: tLoyaltyPoint } = useTranslation('loyaltyPoint')
  const isMobile = useIsMobile()
  const { userInfo } = useUserStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isDetailHistoryOpen, setIsDetailHistoryOpen] = useState(false)
  const [startDate, setStartDate] = useState<string>(searchParams.get('fromDate') || moment().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(searchParams.get('toDate') || moment().format('YYYY-MM-DD'))
  const [history, setHistory] = useState<ILoyaltyPointHistory | null>(null)
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const type = searchParams.get('type') || 'all'
  const { handlePageChange, handlePageSizeChange, setPagination } = usePagination()

  // Sync local state with URL changes (from action)
  useEffect(() => {
    const from = searchParams.get('fromDate')
    const to = searchParams.get('toDate')
    if (from !== null) setStartDate(from)
    if (to !== null) setEndDate(to)
  }, [searchParams])

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 1
    }))
  }, [startDate, endDate, type, setPagination])

  // Total points hook
  const { data: totalPointsData, isLoading: loadingTotalPoints } = useLoyaltyPoints(userInfo?.slug || '')

  // Loyalty point history hook
  const { data: loyaltyPointHistoryData, isLoading: loadingLoyaltyPointHistory } = useLoyaltyPointHistory({
    slug: userInfo?.slug || '',
    page,
    size,
    sort: 'DESC',
    hasPaging: true,
    types: type !== 'all' && Object.values(LoyaltyPointHistoryType).includes(type as LoyaltyPointHistoryType)
      ? [type as LoyaltyPointHistoryType]
      : [
        LoyaltyPointHistoryType.ADD,
        LoyaltyPointHistoryType.USE,
        LoyaltyPointHistoryType.RESERVE,
        LoyaltyPointHistoryType.REFUND,
      ]
    ,
    fromDate: startDate || undefined,
    toDate: endDate || undefined,
  })


  const totalPoints = totalPointsData?.totalPoints || 0
  const loyaltyPointHistory = loyaltyPointHistoryData?.items || []

  const handleDetailHistory = (row: ILoyaltyPointHistory) => {
    setHistory(row)
    setIsDetailHistoryOpen(true)
  }

  // Filter config similar to page.tsx but for loyalty history types
  const filterConfig = [
    {
      id: 'type',
      label: t('profile.points.type'),
      options: [
        { label: t('common.dataTable.all'), value: 'all' },
        { label: t('profile.points.add'), value: LoyaltyPointHistoryType.ADD },
        { label: t('profile.points.use'), value: LoyaltyPointHistoryType.USE },
        { label: t('profile.points.reserve'), value: LoyaltyPointHistoryType.RESERVE },
        { label: t('profile.points.refund'), value: LoyaltyPointHistoryType.REFUND },
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'type') {
      setSearchParams((prev) => {
        prev.set('type', value)
        prev.set('page', '1')
        return prev
      })
    }
  }

  // Coin Summary Cards Component
  const LoyaltyPointSummaryCards = () => {
    if (loadingTotalPoints || loadingLoyaltyPointHistory) {
      return (
        <div className="mb-6">
          <div
            className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4 lg:grid-cols-3'}`}
          >
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="shadow-none animate-pulse">
                  <CardContent className="p-4">
                    <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )
    }

    const summaryItems = [
      {
        title: t('profile.totalEarned'),
        value: totalPoints,
        icon: TrendingUp,
        color: 'text-primary',
        bg: 'bg-primary/10 dark:bg-primary/10',
        border: 'border-primary/20 dark:border-primary/80',
        iconBg:
          'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary',
      },
    ]

    return (
      <div className="flex flex-col gap-4 mb-6">
        <div
          className={`${isMobile ? 'px-3 py-2' : 'px-2 py-4'} bg-primary/10 rounded-md`}
        >
          <div className="flex gap-2 justify-between items-center">
            <Label
              className={`${isMobile ? 'text-sm' : 'text-lg'} text-primary flex items-center gap-2`}
            >
              <span className="p-1 rounded-full text-primary bg-primary/10 dark:bg-primary/10 dark:text-primary">
                <Tag size={isMobile ? 16 : 18} />
              </span>
              {t('profile.points.pointsHistory')}
            </Label>
          </div>
        </div>
        <div
          className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'gap-4'}`}
        >
          <PointConversionRule />
          {summaryItems.map((item, index) => (
            <Card
              key={index}
              className={`border ${item.border} ${item.bg} shadow-none transition-shadow`}
            >
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p
                      className={`mb-1 text-sm font-bold text-gray-600 dark:text-gray-400 ${isMobile ? 'text-[10px]' : ''}`}
                    >
                      {item.title}
                    </p>
                    <div
                      className={`flex items-center gap-1 ${item.color} font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}
                    >
                      <span>{formatPoints(Math.abs(item.value))} {' '} ({tLoyaltyPoint('loyaltyPoint.pointWithCurrency', { points: formatPoints(Math.abs(item.value)) })})</span>
                    </div>
                  </div>
                  <div className={`rounded-full p-2 ${item.iconBg}`}>
                    <item.icon size={isMobile ? 16 : 20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 h-full">
      <LoyaltyPointSummaryCards />
      <LoyaltyPointDetailHistoryDialog
        key={history?.id || 'loyalty-point-dialog'}
        isOpen={isDetailHistoryOpen}
        onOpenChange={(open) => {
          setIsDetailHistoryOpen(open)
          if (!open) {
            setHistory(null)
          }
        }}
        onCloseSheet={() => {
          setIsDetailHistoryOpen(false)
          setHistory(null)
        }}
        history={history}
      />
      <DataTable
        columns={useLoyaltyPointTransactionColumns()}
        data={loyaltyPointHistory || []}
        isLoading={loadingLoyaltyPointHistory}
        pages={loyaltyPointHistoryData?.totalPages || 0}
        hiddenDatePicker={true}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={LoyaltyPointAction}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        onRowClick={handleDetailHistory}
      />
    </div>
  )
}
