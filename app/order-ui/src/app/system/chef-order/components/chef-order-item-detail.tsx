import { useTranslation } from 'react-i18next'
import { NotepadText, PlayCircle, CheckCircle2 } from 'lucide-react'

import { ChefOrderItemStatus, IChefOrderItems, IUpdateChefOrderItemStatusRequest } from '@/types'
import { Badge, Button } from '@/components/ui'
import { ChefOrderItemStatusBadge } from '@/components/app/badge'
import { useUpdateChefOrderItemStatus } from '@/hooks'
import { showToast } from '@/utils'

interface ChefOrderItemDetailProps {
  chefOrderItem: IChefOrderItems
}
export default function ChefOrderItemDetail({ chefOrderItem }: ChefOrderItemDetailProps) {
  const { t } = useTranslation(['chefArea'])
  const { t: tToast } = useTranslation('toast')
  const { mutate: updateChefOrderItemStatus } = useUpdateChefOrderItemStatus()

  const handleStatusChange = (orderItem: IChefOrderItems, status: string) => {
    if (!orderItem) return
    const params: IUpdateChefOrderItemStatusRequest = {
      slug: orderItem.slug,
      status,
    }
    updateChefOrderItemStatus(params, {
      onSuccess: () => {
        showToast(tToast('toast.updateChefOrderItemStatusSuccess'))
      }
    })
  }

  const renderOrderItem = (orderItem: IChefOrderItems) => {
    const isPending = orderItem.status === ChefOrderItemStatus.PENDING
    const isInProgress = orderItem.status === ChefOrderItemStatus.IN_PROGRESS

    return (
      <div key={orderItem.slug} className="mt-4">
        <div className="flex flex-col gap-3">
          {/* Header with name and status */}
          <div className='flex items-center justify-between w-full'>
            <span className='flex items-center gap-2'>
              <span className="text-lg font-semibold">
                {orderItem.orderItem.variant.product.name}
              </span>
              {orderItem.orderItem.variant?.size && (
                <Badge>
                  Size {orderItem.orderItem.variant.size.name.toUpperCase()}
                </Badge>
              )}
            </span>
            <ChefOrderItemStatusBadge status={orderItem.status} />
          </div>

          {/* Note section */}
          {orderItem.orderItem.note ? (
            <div className='flex items-start gap-2 p-3 border rounded-md'>
              <NotepadText className='text-primary' />
              <p className="text-sm text-muted-foreground">{orderItem.orderItem.note}</p>
            </div>
          ) : (
            <div className='flex items-center gap-2 p-3 border rounded-md'>
              <NotepadText className='text-primary' />
              <p className="text-sm text-muted-foreground">{t('chefOrder.noNote')}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-2">
            {isPending && (
              <Button
                className="flex items-center gap-2"
                onClick={() => handleStatusChange(orderItem, ChefOrderItemStatus.IN_PROGRESS)}
              >
                <PlayCircle className="w-4 h-4" />
                {t('chefOrder.startCooking')}
              </Button>
            )}
            {isInProgress && (
              <Button
                className="flex items-center gap-2"
                onClick={() => handleStatusChange(orderItem, ChefOrderItemStatus.COMPLETED)}
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
    <div className="flex flex-col w-full gap-4">
      {Array.isArray(chefOrderItem)
        ? chefOrderItem.map((item) => renderOrderItem(item))
        : chefOrderItem && renderOrderItem(chefOrderItem)}
    </div>
  )
}
