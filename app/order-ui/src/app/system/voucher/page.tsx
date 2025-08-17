import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useVoucherGroupColumns } from './DataTable/columns'
import { usePagination, useVoucherGroups } from '@/hooks'
import { VoucherGroupAction } from './DataTable/actions'
import { ROUTE } from '@/constants'

export default function VoucherGroupPage() {
    const navigate = useNavigate()
    const { t } = useTranslation(['voucher'])
    const { t: tHelmet } = useTranslation('helmet')
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page')) || 1
    const size = Number(searchParams.get('size')) || 10
    const { handlePageChange, handlePageSizeChange, pagination } = usePagination()
    // add page size to query params
    useEffect(() => {
        setSearchParams((prev) => {
            prev.set('page', pagination.pageIndex.toString())
            prev.set('size', pagination.pageSize.toString())
            return prev
        })
    }, [pagination.pageIndex, pagination.pageSize, setSearchParams])

    const { data, isLoading } = useVoucherGroups({
        page,
        size,
        hasPaging: true
    })

    const handleVoucherGroupClick = (slug: string) => {
        navigate(`${ROUTE.STAFF_VOUCHER_GROUP}/${slug}`)
    }

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.voucher.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.voucher.title')} />
            </Helmet>
            <span className="flex gap-1 items-center text-lg">
                <SquareMenu />
                {t('voucher.voucherTitle')}
            </span>
            <div className="grid grid-cols-1 gap-2 mt-4 h-full">
                <DataTable
                    columns={useVoucherGroupColumns()}
                    data={data?.result.items || []}
                    isLoading={isLoading}
                    pages={data?.result.totalPages || 1}
                    hiddenInput={true}
                    onRowClick={(row) => handleVoucherGroupClick(row.slug)}
                    actionOptions={VoucherGroupAction}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
