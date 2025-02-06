import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'
import { DataTable } from '@/components/ui'
import { useUserListColumns } from '../users/DataTable/columns'
import { usePagination, useUsers } from '@/hooks'
import { useState } from 'react'
import { Role } from '@/constants'
import { EmployeeFilterOptions, EmployeesAction } from '../users/DataTable/actions'

export default function VoucherPage() {
    const { t } = useTranslation(['voucher'])
    const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
    const [phonenumber, setPhoneNumber] = useState<string>('')

    const { data, isLoading } = useUsers({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        phonenumber,
        order: 'DESC',
        role: [Role.STAFF, Role.CHEF, Role.MANAGER, Role.ADMIN].join(','),
    })

    const handleSearchChange = (value: string) => {
        setPhoneNumber(value)
    }

    return (
        <div>
            <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4 pr-4">
                <div className="flex flex-col flex-1 w-full">
                    <span className="flex items-center gap-1 text-lg">
                        <SquareMenu />
                        {t('voucher.title')}
                    </span>
                    <div className="grid h-full grid-cols-1 gap-2">
                        <DataTable
                            columns={useUserListColumns()}
                            data={data?.result.items || []}
                            isLoading={isLoading}
                            pages={data?.result.totalPages || 0}
                            hiddenInput={false}
                            onInputChange={handleSearchChange}
                            filterOptions={EmployeeFilterOptions}
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
