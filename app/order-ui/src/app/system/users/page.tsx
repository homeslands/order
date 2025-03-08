import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useUserListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { EmployeeFilterOptions, EmployeesAction } from './DataTable/actions'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

export default function UserListPage() {
  const { t: tHelmet } = useTranslation('helmet')
  const { t } = useTranslation('employee')
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
    <div className="grid grid-cols-1 gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.employee.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.employee.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('employee.title')}
      </span>
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
