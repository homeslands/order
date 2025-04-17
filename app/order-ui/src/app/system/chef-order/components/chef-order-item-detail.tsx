import { useTranslation } from 'react-i18next'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { ChefOrderItemStatus, ChefOrderStatus, ISpecificChefOrderItemInfo, IUpdateChefOrderItemStatusRequest } from '@/types'
import { Button, Tabs, TabsContent } from '@/components/ui'
import { useUpdateChefOrderItemStatus } from '@/hooks'
import { showToast } from '@/utils'

interface ChefOrderItemDetailProps {
  chefOrderItem: ISpecificChefOrderItemInfo
  chefOrderStatus: ChefOrderStatus
  onSuccess: () => void
}

export default function ChefOrderItemDetail({ chefOrderItem, chefOrderStatus, onSuccess }: ChefOrderItemDetailProps) {
  const { t } = useTranslation(['chefArea'])
  const { t: tToast } = useTranslation('toast')
  const { t: tCommon } = useTranslation('common')
  const { mutate: updateChefOrderItemStatus } = useUpdateChefOrderItemStatus()
  const [activeTab, setActiveTab] = useState(chefOrderItem.status)
  const handleStatusChange = (slug: string, status: string) => {
    if (!slug) return
    const params: IUpdateChefOrderItemStatusRequest = {
      slug,
      status,
    }
    updateChefOrderItemStatus(params, {
      onSuccess: () => {
        showToast(tToast('toast.updateChefOrderItemStatusSuccess'))
        setActiveTab(status as ChefOrderItemStatus)
        onSuccess()
      }
    })
  }

  const renderOrderItem = (orderItem: ISpecificChefOrderItemInfo) => {
    const isPending = orderItem.status === ChefOrderItemStatus.PENDING
    const isInProgress = orderItem.status === ChefOrderItemStatus.IN_PROGRESS

    return (
      <div key={orderItem.slug} className="px-2 space-y-4 sm:px-0">
        {/* Product Information */}
        {orderItem.orderItem && orderItem.orderItem !== null ? (
          // <div className={`flex flex-col gap-3 p-4 rounded-lg border ${isPending ? 'bg-yellow-50 border-yellow-500' : isInProgress ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'}`}>
          <div className={`flex flex-col gap-3 p-4 rounded-lg border bg-muted-foreground/5 border-muted-foreground/40`}>
            {/* Item Details */}
            <div className="grid grid-cols-1 gap-4 items-center py-3 rounded-md sm:grid-cols-12">
              <div className="flex gap-3 items-center sm:col-span-8">
                <div
                  className={`h-3 w-3 rounded-full ${isPending
                    ? 'bg-yellow-500'
                    : isInProgress
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                    }`}
                />
                <span className="text-sm font-semibold text-gray-700 sm:text-lg">
                  {orderItem.orderItem.variant.product.name} - Size {orderItem.orderItem.variant.size?.name.toUpperCase()}
                </span>
              </div>

            </div>
            {/* Order Note */}
            <div className="flex gap-2 items-center">
              <span className="text-xl">📝</span>
              <div className="flex gap-1 items-center w-full">
                <span className="text-sm font-semibold">
                  {t('chefOrder.note')}:
                </span>
                <span className="text-sm whitespace-pre-line break-words">
                  {orderItem.orderItem.note ? orderItem.orderItem.note : t('chefOrder.noNote')}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-end w-full sm:col-span-4">
              {chefOrderStatus !== ChefOrderStatus.ACCEPTED && chefOrderStatus !== ChefOrderStatus.COMPLETED && (
                <span
                  className="flex gap-2 items-center w-full text-destructive sm:w-fit"
                >
                  {t('chefOrder.notAccepted')}
                </span>
              )}
              {isPending && (
                <Button
                  disabled={chefOrderStatus === ChefOrderStatus.PENDING}
                  className="flex gap-2 items-center w-full text-white bg-blue-500 sm:w-fit hover:bg-blue-600"
                  onClick={() => handleStatusChange(orderItem.slug, ChefOrderItemStatus.IN_PROGRESS)}
                >
                  <PlayCircle className="w-4 h-4" />
                  {t('chefOrder.startCooking')}
                </Button>
              )}
              {isInProgress && (
                <Button
                  className="flex gap-2 items-center w-full text-white bg-green-500 sm:w-fit hover:bg-green-600"
                  onClick={() => handleStatusChange(orderItem.slug, ChefOrderItemStatus.COMPLETED)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('chefOrder.complete')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
            {tCommon('common.noData')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChefOrderItemStatus)} className="w-full">
        <TabsContent value={ChefOrderItemStatus.PENDING}>
          {chefOrderItem.status === ChefOrderItemStatus.PENDING && renderOrderItem(chefOrderItem)}
        </TabsContent>
        <TabsContent value={ChefOrderItemStatus.IN_PROGRESS}>
          {chefOrderItem.status === ChefOrderItemStatus.IN_PROGRESS && renderOrderItem(chefOrderItem)}
        </TabsContent>
        <TabsContent value={ChefOrderItemStatus.COMPLETED}>
          {chefOrderItem.status === ChefOrderItemStatus.COMPLETED && renderOrderItem(chefOrderItem)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
