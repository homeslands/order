import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlarmClock } from 'lucide-react'

import { useOrders, usePagination } from '@/hooks'
import { useUserStore } from '@/stores'
import { OrderStatus } from '@/types'

export default function OrderWaitListCounting() {
  const { t } = useTranslation(['menu'])
  const { userInfo } = useUserStore()
  const { pagination } = usePagination()

  const { data, refetch } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    owner: userInfo?.slug,
    order: 'DESC',
    branchSlug: userInfo?.branch?.slug,
    status: [OrderStatus.PENDING].join(','),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="flex h-[8rem] min-w-[12rem] flex-col justify-between rounded-md border p-6 text-muted-foreground">
      <div className="text-md flex flex-row items-center justify-between">
        {t('order.pendingOrders')}
        <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-green-100 p-3">
          <AlarmClock className="icon text-green-500" />
        </div>
      </div>
      <span className="flex h-full items-center text-3xl">
        {data?.result.total}
      </span>
    </div>
  )
}
