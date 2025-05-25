import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
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
    const { handlePageChange, handlePageSizeChange, pagination } = usePagination()
    const { data, isLoading } = useVoucherGroups({
        page: pagination.pageIndex,
        size: pagination.pageSize,
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
                    hiddenInput={false}
                    onRowClick={(row) => handleVoucherGroupClick(row.slug)}
                    actionOptions={VoucherGroupAction}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
