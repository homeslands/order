import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useVoucherColumns } from './DataTable/columns'
import { usePagination, useVouchers } from '@/hooks'
import { VoucherAction } from './DataTable/actions'
import { Helmet } from 'react-helmet'

export default function VoucherPage() {
    const { t } = useTranslation(['voucher'])
    const { t: tHelmet } = useTranslation('helmet')
    const { handlePageChange, handlePageSizeChange } = usePagination()
    const { data, isLoading } = useVouchers({
        isActive: true,
    })

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.voucher.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.voucher.title')} />
            </Helmet>
            <span className="flex items-center gap-1 text-lg">
                <SquareMenu />
                {t('voucher.voucherTitle')}
            </span>
            <div className="grid h-full grid-cols-1 gap-2 mt-4">
                <DataTable
                    columns={useVoucherColumns()}
                    data={data?.result || []}
                    isLoading={isLoading}
                    pages={1}
                    hiddenInput={false}
                    actionOptions={VoucherAction}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
