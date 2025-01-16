import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useUserListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { EmployeeFilterOptions, EmployeesAction } from './DataTable/actions'
import { useState } from 'react'

export default function UserListPage() {
  const { t } = useTranslation(['employee'])
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
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col items-center gap-2 bg-transparent">
        <span className="flex items-center justify-start w-full gap-1 text-lg">
          <SquareMenu />
          {t('employee.title')}
        </span>
      </div>
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
  )
}
