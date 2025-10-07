import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { usePagination, useUserGroups } from '@/hooks'
import { useUserGroupListColumns } from './DataTable/columns'
import { ROUTE } from '@/constants'
import { UserGroupAction } from './DataTable/actions'
import { IUserGroup } from '@/types'

export default function UserGroupPage() {
  const { t } = useTranslation('customer')
  const { t: tHelmet } = useTranslation('helmet')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [name, setName] = useState<string>('')

  // add page size to query params
  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('page', pagination.pageIndex.toString())
      prev.set('size', pagination.pageSize.toString())
      return prev
    })
  }, [pagination.pageIndex, pagination.pageSize, setSearchParams])

  const { data, isLoading } = useUserGroups({
    page,
    size,
    hasPaging: true,
    name,
  })

  const handleSearchChange = (value: string) => {
    setName(value)
  }

  const handleRowClick = (row: IUserGroup) => {
    navigate(`${ROUTE.STAFF_CUSTOMER_GROUP_MANAGEMENT}/${row.slug}`)
  }

  return (
    <div className="grid grid-cols-1 gap-2 h-full">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.userGroup.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.userGroup.title')} />
      </Helmet>
      <span className="flex gap-1 items-center text-lg">
        <SquareMenu />
        {t('customer.userGroup.title')}
      </span>
      <DataTable
        columns={useUserGroupListColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result.totalPages || 0}
        onInputChange={handleSearchChange}
        hiddenInput={false}
        searchPlaceholder={t('customer.userGroup.searchByName')}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={UserGroupAction}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
