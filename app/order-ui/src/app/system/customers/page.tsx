import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useUsers, usePagination } from '@/hooks'
import { useUserListColumns } from './DataTable/columns'
import { Role } from '@/constants'
import { CustomerAction } from './DataTable/actions'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

export default function CustomerPage() {
  const { t } = useTranslation('customer')
  const { t: tHelmet } = useTranslation('helmet')
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
    <div className="grid h-full grid-cols-1 gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.customer.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.customer.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('customer.title')}
      </span>
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
