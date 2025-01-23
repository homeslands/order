import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useUserListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { EmployeeFilterOptions, EmployeesAction } from './DataTable/actions'

export default function UserListPage() {
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
    <div className="mt-4 grid grid-cols-1 gap-2">
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
  )
}
