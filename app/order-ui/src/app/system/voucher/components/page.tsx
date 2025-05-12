import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { usePagination, useVouchers } from '@/hooks'
import { VoucherAction } from '../DataTable/actions'
import { useVoucherColumns } from '../DataTable/columns'
import { useParams } from 'react-router-dom'

export default function VoucherPage() {
    const { t } = useTranslation(['voucher'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { handlePageChange, handlePageSizeChange, pagination } = usePagination()
    const { data, isLoading, refetch } = useVouchers({
        voucherGroup: slug,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        hasPaging: true
    })

    const handleCreateVoucherSuccess = () => {
        refetch()
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
                    columns={useVoucherColumns()}
                    data={data?.result.items || []}
                    isLoading={isLoading}
                    pages={data?.result.totalPages || 1}
                    hiddenInput={false}
                    actionOptions={() => <VoucherAction onSuccess={handleCreateVoucherSuccess} />}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
