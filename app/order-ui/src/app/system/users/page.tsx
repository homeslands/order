import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useEmployeeListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { EmployeeFilterOptions, EmployeesAction } from './DataTable/actions'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

export default function EmployeeListPage() {
  const { t: tHelmet } = useTranslation('helmet')
  const { t } = useTranslation('employee')
  const { t: tCommon } = useTranslation('common')
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [phonenumber, setPhoneNumber] = useState<string>('')
  const [role, setRole] = useState<Role | 'all'>('all')

  const { data, isLoading } = useUsers({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    phonenumber,
    order: 'DESC',
    role: role !== 'all' ? role : [Role.STAFF, Role.CHEF, Role.MANAGER, Role.ADMIN].join(','),
  })

  const filterConfig = [
    {
      id: 'role',
      label: t('employee.role'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        { label: t('employee.ADMIN'), value: Role.ADMIN },
        { label: t('employee.MANAGER'), value: Role.MANAGER },
        { label: t('employee.STAFF'), value: Role.STAFF },
        { label: t('employee.CHEF'), value: Role.CHEF },
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'role') {
      setRole(value as Role | 'all')
    }
  }

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
      <span className="flex gap-1 items-center text-lg">
        <SquareMenu />
        {t('employee.title')}
      </span>
      <DataTable
        columns={useEmployeeListColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result.totalPages || 0}
        hiddenInput={false}
        onInputChange={handleSearchChange}
        filterOptions={EmployeeFilterOptions}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        actionOptions={EmployeesAction}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
