import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useUserListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { CustomerAction } from './DataTable/actions'

export default function CustomerPage() {
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [phonenumber, setPhoneNumber] = useState<string>('')

  const { data, isLoading } = useUsers({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    order: 'DESC',
    phonenumber,
    role: Role.CUSTOMER,
  })

  const handleSearchChange = (value: string) => {
    setPhoneNumber(value)
  }

  return (
    <div className="mt-4 grid h-full grid-cols-1 gap-2">
      <DataTable
        columns={useUserListColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result.totalPages || 0}
        onInputChange={handleSearchChange}
        hiddenInput={false}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={CustomerAction}
      />
    </div>
  )
}
