import { useEffect, useState } from 'react'
import moment from 'moment'
import { useParams, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { CoinsIcon, TrendingUp } from 'lucide-react'

import { Card, CardContent, DataTable } from '@/components/ui'
import { usePagination, useLoyaltyPointHistory, useIsMobile, useLoyaltyPoints } from '@/hooks'
import { useLoyaltyPointHistoryColumns } from '@/app/system/customers/DataTable/columns'
import { LoyaltyPointHistoryType } from '@/constants'
import { ILoyaltyPointHistory } from '@/types'
import { LoyaltyPointHistoryAction } from '@/app/system/customers/DataTable/actions'
import { StaffLoyaltyPointDetailHistoryDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'

export function SystemCustomerLoyaltyPointTabsContent() {
  const isMobile = useIsMobile()
  const { t } = useTranslation('loyaltyPoint')
  const { t: tProfile } = useTranslation('profile')
  const { t: tHelmet } = useTranslation('helmet')
  const { slug } = useParams()
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
  const { data: totalPointsData, isLoading: loadingTotalPoints } = useLoyaltyPoints(slug || '')

  // Loyalty point history hook
  const { data: loyaltyPointHistory, isLoading: loadingLoyaltyPointHistory } = useLoyaltyPointHistory({
    slug: slug || '',
    page,
    size,
    sort: 'DESC',
    hasPaging: true,
    fromDate: startDate || undefined,
    toDate: endDate || undefined,
    types: type !== 'all' && Object.values(LoyaltyPointHistoryType).includes(type as LoyaltyPointHistoryType)
      ? [type as LoyaltyPointHistoryType]
      : [
        LoyaltyPointHistoryType.ADD,
        LoyaltyPointHistoryType.USE,
        LoyaltyPointHistoryType.RESERVE,
        LoyaltyPointHistoryType.REFUND,
      ]
  })

  const handleDetailHistory = (row: ILoyaltyPointHistory) => {
    setHistory(row)
    setIsDetailHistoryOpen(true)
  }

  // Filter config similar to page.tsx but for loyalty history types
  const filterConfig = [
    {
      id: 'type',
      label: tProfile('profile.points.type'),
      options: [
        { label: t('common.dataTable.all'), value: 'all' },
        { label: tProfile('profile.points.add'), value: LoyaltyPointHistoryType.ADD },
        { label: tProfile('profile.points.use'), value: LoyaltyPointHistoryType.USE },
        { label: tProfile('profile.points.reserve'), value: LoyaltyPointHistoryType.RESERVE },
        { label: tProfile('profile.points.refund'), value: LoyaltyPointHistoryType.REFUND },
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
        title: tProfile('profile.totalEarned'),
        value: totalPointsData?.totalPoints || 0,
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
          className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'gap-4'}`}
        >
          {/* Summary items */}
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
                      <span>{formatCurrency(Math.abs(item.value), '')}</span>
                      <CoinsIcon
                        className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`}
                      />
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

  // Keep URL in sync when table changes page/size so hooks re-fetch
  const onTablePageChange = (nextPage: number) => {
    setSearchParams(prev => { prev.set('page', String(nextPage)); return prev })
    handlePageChange(nextPage)
  }

  const onTablePageSizeChange = (nextSize: number) => {
    setSearchParams(prev => { prev.set('size', String(nextSize)); prev.set('page', '1'); return prev })
    handlePageSizeChange(nextSize)
    setPagination(prev => ({ ...prev, pageIndex: 1 }))
  }

  return (
    <div className="grid grid-cols-1 gap-2 h-full">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.customer.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.customer.title')} />
      </Helmet>
      <LoyaltyPointSummaryCards />
      <StaffLoyaltyPointDetailHistoryDialog
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
        columns={useLoyaltyPointHistoryColumns()}
        data={loyaltyPointHistory?.items || []}
        isLoading={loadingLoyaltyPointHistory}
        pages={loyaltyPointHistory?.totalPages || 0}
        hiddenInput={true}
        hiddenDatePicker={true}
        searchPlaceholder={tProfile('profile.points.searchByPhoneNumber')}
        onPageChange={onTablePageChange}
        onPageSizeChange={onTablePageSizeChange}
        actionOptions={LoyaltyPointHistoryAction}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        onRowClick={handleDetailHistory}
      />
    </div>
  )
}
