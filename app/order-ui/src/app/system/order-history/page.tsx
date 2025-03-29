import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useOrders, usePagination } from '@/hooks'
import { useUserStore } from '@/stores'
import { useOrderHistoryColumns } from './DataTable/columns'
import { IOrder, OrderStatus } from '@/types'
import OrderFilter from './DataTable/actions/order-filter'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '@/constants'

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')

  const { data, isLoading } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: 'DESC',
    branchSlug: userInfo?.branch?.slug || '',
    hasPaging: true,
    status: status !== 'all' ? status : [OrderStatus.PENDING, OrderStatus.SHIPPING, OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.COMPLETED].join(','),
  })

  const filterConfig = [
    {
      id: 'status',
      label: t('order.status'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        { label: t('order.pending'), value: OrderStatus.PENDING },
        { label: t('order.shipping'), value: OrderStatus.SHIPPING },
        { label: t('order.paid'), value: OrderStatus.PAID },
        { label: t('order.failed'), value: OrderStatus.FAILED },
        { label: t('order.completed'), value: OrderStatus.COMPLETED },
      ],
    },
    // {
    //   id: 'paymentStatus',
    //   label: t('order.paymentStatus'),
    //   options: [
    //     { label: t('order.paid'), value: true },
    //     { label: t('order.unpaid'), value: false },
    //   ],
    // },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'status') {
      setStatus(value as OrderStatus | 'all')
    }
  }

  const handleOrderClick = (order: IOrder) => {
    navigate(`${ROUTE.STAFF_ORDER_HISTORY}/${order.slug}`)
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.orderHistory.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.orderHistory.title')} />
      </Helmet>
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('order.title')}
      </span>
      <div className="grid grid-cols-1 h-full">
        <DataTable
          columns={useOrderHistoryColumns()}
          data={data?.result?.items || []}
          isLoading={isLoading}
          pages={data?.result?.totalPages || 0}
          onRowClick={handleOrderClick}
          filterOptions={OrderFilter}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
