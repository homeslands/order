import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { usePagination, useSpecificVoucher, useVouchers } from '@/hooks'
import { VoucherAction } from '../DataTable/actions'
import { useVoucherColumns } from '../DataTable/columns'
import { IVoucher } from '@/types'

export default function VoucherPage() {
    const { t } = useTranslation(['voucher'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedVouchers, setSelectedVouchers] = useState<IVoucher[]>([])
    const [voucherCode, setVoucherCode] = useState<string>('')
    const { handlePageChange, handlePageSizeChange, pagination } = usePagination()
    const { data: voucherListData, isLoading: isLoadingList, refetch: refetchList } = useVouchers({
        order: 'DESC',
        voucherGroup: slug,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        hasPaging: true
    })

    const { data: specificVoucher, isLoading: isLoadingSpecificVoucher } = useSpecificVoucher({
        code: voucherCode,
    })

    const data = voucherCode
        ? specificVoucher ? [specificVoucher.result] : []
        : voucherListData?.result.items || []

    const isLoading = voucherCode ? isLoadingSpecificVoucher : isLoadingList

    const handleSelectionChange = useCallback((selectedSlugs: IVoucher[]) => {
        setSelectedVouchers(selectedSlugs)
    }, [])

    const handleCreateVoucherSuccess = () => {
        setSelectedVouchers([])
        refetchList()
    }

    const handleUpdateVoucherSuccess = () => {
        refetchList()
    }

    const handleSearchChange = (value: string) => {
        if (value === '') {
            setVoucherCode('')
            return
        }
        setVoucherCode(value)
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
                    columns={useVoucherColumns(handleUpdateVoucherSuccess, handleSelectionChange, selectedVouchers)}
                    data={data}
                    isLoading={isLoading}
                    pages={voucherListData?.result.totalPages || 1}
                    hiddenInput={false}
                    searchPlaceholder={t('voucher.searchByCode')}
                    onInputChange={handleSearchChange}
                    actionOptions={() => <VoucherAction onSuccess={handleCreateVoucherSuccess} selectedVouchers={selectedVouchers} onOpenChange={setIsOpen} isConfirmExportVoucherDialogOpen={isOpen} />}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
