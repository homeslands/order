import { useEffect, useState } from 'react'
import moment from 'moment'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { CoinsIcon, SquareMenu, TrendingUp } from 'lucide-react'

import { Card, CardContent, DataTable } from '@/components/ui'
import { useUsers, usePagination, useLoyaltyPointHistory, useIsMobile, useLoyaltyPoints } from '@/hooks'
import { useLoyaltyPointHistoryColumns } from './DataTable/columns'
import { LoyaltyPointHistoryType, Role } from '@/constants'
import { ILoyaltyPointHistory } from '@/types'
import { LoyaltyPointHistoryAction } from './DataTable/actions'
import { StaffLoyaltyPointDetailHistoryDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'

export default function CustomerPage() {
    const isMobile = useIsMobile()
    const { t } = useTranslation('loyaltyPoint')
    const { t: tProfile } = useTranslation('profile')
    const { t: tHelmet } = useTranslation('helmet')
    const [searchParams, setSearchParams] = useSearchParams()
    const [isDetailHistoryOpen, setIsDetailHistoryOpen] = useState(false)
    const [startDate, setStartDate] = useState<string>(searchParams.get('fromDate') || moment().startOf('year').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState<string>(searchParams.get('toDate') || moment().format('YYYY-MM-DD'))
    const [history, setHistory] = useState<ILoyaltyPointHistory | null>(null)
    const page = Number(searchParams.get('page')) || 1
    const size = Number(searchParams.get('size')) || 10
    const type = searchParams.get('type') || 'all'
    const { pagination, handlePageChange, handlePageSizeChange, setPagination } = usePagination()
    const [phonenumber, setPhoneNumber] = useState<string>('')

    // Sync local state with URL changes (from action)
    useEffect(() => {
        const from = searchParams.get('fromDate')
        const to = searchParams.get('toDate')
        if (from !== null) setStartDate(from)
        if (to !== null) setEndDate(to)
    }, [searchParams])

    // Initialize URL params if not present (sync with action component)
    useEffect(() => {
        const from = searchParams.get('fromDate')
        const to = searchParams.get('toDate')
        if (!from || !to) {
            setSearchParams((prev) => {
                if (!from) prev.set('fromDate', moment().startOf('year').format('YYYY-MM-DD'))
                if (!to) prev.set('toDate', moment().format('YYYY-MM-DD'))
                return prev
            })
        }
    }, [searchParams, setSearchParams])

    // Reset page when filters change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            pageIndex: 1
        }))
    }, [startDate, endDate, type, setPagination])

    // add page size to query params
    useEffect(() => {
        setSearchParams((prev) => {
            prev.set('page', pagination.pageIndex.toString())
            prev.set('size', pagination.pageSize.toString())
            return prev
        })
    }, [pagination.pageIndex, pagination.pageSize, setSearchParams])


    const hasPhone = phonenumber && phonenumber.trim().length > 0
    const { data, isLoading } = useUsers(hasPhone ? {
        page,
        size,
        order: 'DESC',
        phonenumber,
        hasPaging: true,
        role: Role.CUSTOMER,
    } : null)

    // Total points hook
    const selectedUserSlug = data?.result?.items?.[0]?.slug
    const { data: totalPointsData, isLoading: loadingTotalPoints } = useLoyaltyPoints(selectedUserSlug)

    const { data: loyaltyPointHistory, isLoading: loadingLoyaltyPointHistory } = useLoyaltyPointHistory({
        slug: selectedUserSlug || '', page, size, sort: 'DESC', hasPaging: true,
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

    const handleSearchChange = (value: string) => {
        setPhoneNumber(value)
    }

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
                    {/* User Info */}
                    <div className="flex flex-col gap-2 p-3 rounded-md border bg-muted-foreground/10">
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            {tProfile('profile.points.userInfo')}
                        </p>
                        {!hasPhone && (
                            <p className="text-xs text-muted-foreground">{tProfile('profile.points.searchPhonePrompt')}</p>
                        )}
                        {hasPhone && !selectedUserSlug && (
                            <p className="text-xs text-muted-foreground">{tProfile('profile.points.noUserFound')}</p>
                        )}
                        {selectedUserSlug && (
                            <div className="grid grid-cols-1 gap-1">
                                <p className="text-sm font-semibold">{data?.result.items[0].firstName} {data?.result.items[0].lastName}</p>
                                <p className="text-sm text-muted-foreground">{data?.result.items[0].phonenumber}</p>
                            </div>
                        )}
                    </div>
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

    return (
        <div className="grid grid-cols-1 gap-2 h-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.customer.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.customer.title')} />
            </Helmet>
            <span className="flex gap-1 items-center text-lg">
                <SquareMenu />
                {tProfile('profile.points.title')}
            </span>
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
                isLoading={isLoading}
                pages={loyaltyPointHistory?.totalPages || 0}
                onInputChange={handleSearchChange}
                hiddenInput={false}
                searchPlaceholder={tProfile('profile.points.searchByPhoneNumber')}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                actionOptions={LoyaltyPointHistoryAction}
                filterConfig={filterConfig}
                onFilterChange={handleFilterChange}
                onRowClick={handleDetailHistory}
            />
        </div>
    )
}
