import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useOrders, usePagination } from '@/hooks'
import { useUserStore } from '@/stores'
import { useOrderHistoryColumns } from './DataTable/columns'

export default function OrderHistoryPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()

  const { data, isLoading } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: 'DESC',
    branchSlug: userInfo?.branch.slug,
    hasPaging: true,
  })

  return (
    <div className="flex flex-col">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.orderHistory.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.orderHistory.title')} />
      </Helmet>
      <span className="flex items-center justify-start w-full gap-1 text-lg">
        <SquareMenu />
        {t('order.title')}
      </span>
      <div className="grid h-full grid-cols-1">
        <DataTable
          columns={useOrderHistoryColumns()}
          data={data?.result.items || []}
          isLoading={isLoading}
          pages={data?.result.totalPages || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
