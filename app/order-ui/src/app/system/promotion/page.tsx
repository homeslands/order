import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useVoucherColumns } from './DataTable/columns'
import { usePagination, useVouchers } from '@/hooks'
import { EmployeesAction } from './DataTable/actions'

export default function PromotionPage() {
    const { t } = useTranslation(['promotion'])
    const { handlePageChange, handlePageSizeChange } = usePagination()
    const { data, isLoading } = useVouchers()

    return (
        <div>
            <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4 pr-4">
                <div className="flex flex-col flex-1 w-full">
                    <span className="flex items-center gap-1 text-lg">
                        <SquareMenu />
                        {t('promotion.promotionTitle')}
                    </span>
                    <div className="grid h-full grid-cols-1 gap-2 mt-4">
                        <DataTable
                            columns={useVoucherColumns()}
                            data={data?.result || []}
                            isLoading={isLoading}
                            pages={1}
                            hiddenInput={false}
                            // filterOptions={EmployeeFilterOptions}
                            actionOptions={EmployeesAction}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
