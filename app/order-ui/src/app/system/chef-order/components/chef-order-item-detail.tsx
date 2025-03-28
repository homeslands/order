import { useTranslation } from 'react-i18next'
import { PlayCircle, CheckCircle2 } from 'lucide-react'

import { ChefOrderItemStatus, ISpecificChefOrderItemInfo, IUpdateChefOrderItemStatusRequest } from '@/types'
import { Badge, Button } from '@/components/ui'
import { useUpdateChefOrderItemStatus } from '@/hooks'
import { showToast } from '@/utils'
import { ChefOrderItemStatusBadge } from '@/components/app/badge'

interface ChefOrderItemDetailProps {
  chefOrderItem: ISpecificChefOrderItemInfo
}

export default function ChefOrderItemDetail({ chefOrderItem }: ChefOrderItemDetailProps) {
  const { t } = useTranslation(['chefArea'])
  const { t: tToast } = useTranslation('toast')
  const { mutate: updateChefOrderItemStatus } = useUpdateChefOrderItemStatus()

  const handleStatusChange = (slug: string, status: string) => {
    if (!slug) return
    const params: IUpdateChefOrderItemStatusRequest = {
      slug,
      status,
    }
    updateChefOrderItemStatus(params, {
      onSuccess: () => {
        showToast(tToast('toast.updateChefOrderItemStatusSuccess'))
      }
    })
  }

  const renderOrderItem = (orderItem: ISpecificChefOrderItemInfo) => {
    const isPending = orderItem.status === ChefOrderItemStatus.PENDING
    const isInProgress = orderItem.status === ChefOrderItemStatus.IN_PROGRESS

    return (
      <div key={orderItem.slug} className="mt-4">
        {/* Product Information */}
        <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Badge className="h-9 text-md">
                {orderItem.orderItem.variant.product.name}
              </Badge>
              <Badge variant="outline" className="h-9 text-sm">
                Size {orderItem.orderItem.variant.size?.name.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Order Note */}
          {orderItem.orderItem.note && (
            <div className="flex gap-2 items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm font-semibold text-gray-600">
                {t('chefOrder.note')}:
              </span>
              <span className="text-sm text-gray-600">
                {orderItem.orderItem.note}
              </span>
            </div>
          )}

          {/* Item Details */}
          <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-gray-50 rounded-md">
            <div className="flex col-span-8 gap-3 items-center">
              <div
                className={`h-3 w-3 rounded-full ${isPending
                  ? 'bg-yellow-500'
                  : isInProgress
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                  }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {orderItem.orderItem.variant.product.name}
              </span>
            </div>

            {/* <div className="flex col-span-4 justify-center items-center">
              <span className="text-sm font-semibold text-gray-700">
                {orderItem.orderItem.variant.size?.name.toUpperCase()}
              </span>
            </div> */}

            <div className="flex col-span-4 gap-2 justify-end items-center">
              <ChefOrderItemStatusBadge status={orderItem.status} />
              {isPending && (
                <Badge variant="secondary" className="text-xs">
                  {t('chefOrder.waitingToStart')}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-2">
            {isPending && (
              <Button
                className="flex gap-2 items-center text-white bg-blue-500 hover:bg-blue-600"
                onClick={() => handleStatusChange(orderItem.slug, ChefOrderItemStatus.IN_PROGRESS)}
              >
                <PlayCircle className="w-4 h-4" />
                {t('chefOrder.startCooking')}
              </Button>
            )}
            {isInProgress && (
              <Button
                className="flex gap-2 items-center text-white bg-green-500 hover:bg-green-600"
                onClick={() => handleStatusChange(orderItem.slug, ChefOrderItemStatus.COMPLETED)}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('chefOrder.complete')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.isArray(chefOrderItem)
        ? chefOrderItem.map((item) => renderOrderItem(item))
        : chefOrderItem && renderOrderItem(chefOrderItem)}
    </div>
  )
}
