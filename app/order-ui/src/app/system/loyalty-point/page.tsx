import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination, useLoyaltyPointHistory } from '@/hooks'
import { useLoyaltyPointHistoryColumns } from './DataTable/columns'
import { LoyaltyPointHistoryType, Role } from '@/constants'

export default function CustomerPage() {
    const { t } = useTranslation('loyaltyPoint')
    const { t: tHelmet } = useTranslation('helmet')
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page')) || 1
    const size = Number(searchParams.get('size')) || 10
    const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
    const [phonenumber, setPhoneNumber] = useState<string>('')

    // add page size to query params
    useEffect(() => {
        setSearchParams((prev) => {
            prev.set('page', pagination.pageIndex.toString())
            prev.set('size', pagination.pageSize.toString())
            return prev
        })
    }, [pagination.pageIndex, pagination.pageSize, setSearchParams])

    const { data, isLoading } = useUsers({
        page,
        size,
        order: 'DESC',
        phonenumber,
        hasPaging: true,
        role: Role.CUSTOMER,
    })

    const { data: loyaltyPointHistory } = useLoyaltyPointHistory({ slug: data?.result.items[0].slug || '', page, size, sort: 'DESC', hasPaging: true, types: [LoyaltyPointHistoryType.ADD, LoyaltyPointHistoryType.USE, LoyaltyPointHistoryType.RESERVE, LoyaltyPointHistoryType.REFUND] })

    const handleSearchChange = (value: string) => {
        setPhoneNumber(value)
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
                {t('loyaltyPoint.title')}
            </span>
            <DataTable
                columns={useLoyaltyPointHistoryColumns()}
                data={loyaltyPointHistory?.items || []}
                isLoading={isLoading}
                pages={loyaltyPointHistory?.totalPages || 0}
                onInputChange={handleSearchChange}
                hiddenInput={false}
                searchPlaceholder={t('loyaltyPoint.searchByPhoneNumber')}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            // actionOptions={LoyaltyPointHistoryAction}
            />
        </div>
    )
}
