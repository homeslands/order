import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { ChefOrderItemStatus, IOrder, OrderItemStatus } from '@/types'
import OrderItemDetail from './order-item-detail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useIsMobile } from '@/hooks'
import { DeliveryOrderTypeSelect } from '@/components/app/select'
import OrderInformation from './order-general-information'

interface IOrderItemListProps {
  orderDetailData?: IOrder
}

export default function OrderItemList({
  orderDetailData,
}: IOrderItemListProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<OrderItemStatus>(OrderItemStatus.ORDER_ITEM_LIST)

  const getStatusCounts = () => {
    if (!orderDetailData?.orderItems) {
      return { pending: 0, running: 0, completed: 0, failed: 0 }
    }

    return orderDetailData.orderItems.reduce(
      (acc, item) => {
        // Check if item is completed in kitchen
        const isCompletedInKitchen = item.chefOrderItems?.some(
          (chefItem) => chefItem.status === ChefOrderItemStatus.COMPLETED
        )

        // Check if item has any delivery status
        const hasDeliveryStatus = item.status.PENDING || item.status.RUNNING || item.status.COMPLETED || item.status.FAILED

        // If completed in kitchen but no delivery status, count as pending
        if (isCompletedInKitchen && !hasDeliveryStatus) {
          acc.pending += 1
        } else if (!isCompletedInKitchen) {
          // Only count as pending if not completed in kitchen
          acc.pending += item.status.PENDING ? 1 : 0
        }

        acc.running += item.status.RUNNING ? 1 : 0
        acc.completed += item.status.COMPLETED ? 1 : 0
        acc.failed += item.status.FAILED ? 1 : 0
        return acc
      },
      { pending: 0, running: 0, completed: 0, failed: 0 }
    )
  }

  const { pending, running, completed, failed } = getStatusCounts()

  const filteredItems = orderDetailData?.orderItems?.filter(item => {
    const isCompletedInKitchen = item.chefOrderItems?.some(
      (chefItem) => chefItem.status === ChefOrderItemStatus.COMPLETED
    )
    const hasDeliveryStatus = item.status.PENDING || item.status.RUNNING || item.status.COMPLETED || item.status.FAILED

    if (activeTab === OrderItemStatus.PENDING) {
      if (isCompletedInKitchen && !hasDeliveryStatus) return true
      return item.status.PENDING
    }
    if (activeTab === OrderItemStatus.RUNNING) return item.status.RUNNING
    if (activeTab === OrderItemStatus.COMPLETED) return item.status.COMPLETED
    if (activeTab === OrderItemStatus.FAILED) return item.status.FAILED
    return false
  }) || []

  return (
    <div>
      {/* Order Items List with Tabs */}
      {/* <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted-foreground/20 -translate-y-1/2"></div>
          <div className="flex relative justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <Clock className={`w-4 h-4 ${pending > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.deliveryPending')}</span>
              <span className="text-[0.5rem] sm:text-xs text-gray-500">{pending} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${running > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <AlertCircle className={`w-4 h-4 ${running > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.shipping')}</span>
              <span className="text-[0.5rem] sm:text-xs text-gray-500">{running} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle2 className={`w-4 h-4 ${completed > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.completed')}</span>
              <span className="text-[0.5rem] sm:text-xs text-gray-500">{completed} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${failed > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <XCircle className={`w-4 h-4 ${failed > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.failed')}</span>
              <span className="text-[0.5rem] sm:text-xs text-gray-500">{failed} {t('order.items')}</span>
            </div>
          </div>
        </div> */}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderItemStatus)} className="p-2 w-full h-full rounded-lg border-2 bg-muted-foreground/5">
        {!isMobile ? (
          <TabsList className={`grid grid-cols-5 ${isMobile ? 'mr-2' : ''} px-1 py-0 text-[0.5rem] sm:text-sm`}>
            <TabsTrigger value={OrderItemStatus.ORDER_ITEM_LIST} className="min-w-[6rem] whitespace-nowrap">
              {isMobile ? `${t('order.orderItemListMobile')}` : `${t('order.orderItemList')}`}
            </TabsTrigger>
            <TabsTrigger value={OrderItemStatus.PENDING} className="min-w-[6rem] whitespace-nowrap">
              {isMobile ? `${t('order.deliveryPendingMobile')} (${pending})` : `${t('order.deliveryPending')} (${pending})`}
            </TabsTrigger>
            <TabsTrigger value={OrderItemStatus.RUNNING} className="min-w-[6rem] whitespace-nowrap">
              {isMobile ? `${t('order.shippingMobile')} (${running})` : `${t('order.shipping')} (${running})`}
            </TabsTrigger>
            <TabsTrigger value={OrderItemStatus.COMPLETED} className="min-w-[6rem] whitespace-nowrap">
              {isMobile ? `${t('order.completedMobile')} (${completed})` : `${t('order.completed')} (${completed})`}
            </TabsTrigger>
            <TabsTrigger value={OrderItemStatus.FAILED} className="min-w-[6rem] whitespace-nowrap">
              {isMobile ? `${t('order.failedMobile')} (${failed})` : `${t('order.failed')} (${failed})`}
            </TabsTrigger>
          </TabsList>
        ) : (
          <div className="p-2 w-full h-full sm:p-4">
            <div className='flex justify-end w-full'>
              <DeliveryOrderTypeSelect defaultValue={activeTab} onChange={(value) => {
                setActiveTab(value as OrderItemStatus)
              }} />
            </div>
          </div>
        )}

        <TabsContent value={OrderItemStatus.ORDER_ITEM_LIST} className={`flex flex-col gap-4 p-2 h-[calc(100vh-10rem)]`}>
          {orderDetailData?.orderItems?.length && orderDetailData?.orderItems?.length > 0 ? (
            orderDetailData.orderItems.map((item) => (
              <div key={item.slug} className="grid gap-4 items-center w-full">
                <OrderInformation orderDetailData={item} />
              </div>
            ))
          ) : (
            <p className={`flex justify-center items-center h-[calc(100vh-21rem)] text-muted-foreground`}>
              {tCommon('common.noData')}
            </p>
          )}
          {/* </ScrollArea> */}
        </TabsContent>
        <TabsContent value={OrderItemStatus.PENDING} className={`h-[calc(100vh-25rem)]`}>
          {/* <ScrollArea className="h-[calc(100vh-20em)]"> */}
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.slug} className="grid gap-4 items-center w-full">
                <OrderItemDetail order={item} />
              </div>
            ))
          ) : (
            <p className={`flex justify-center items-center h-[calc(100vh-21rem)] text-muted-foreground`}>
              {tCommon('common.noData')}
            </p>
          )}
          {/* </ScrollArea> */}
        </TabsContent>
        <TabsContent value={OrderItemStatus.RUNNING} className='h-[calc(100vh-25rem)]'>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <OrderItemDetail order={item} />
            ))
          ) : (
            <p className="flex justify-center items-center h-[calc(100vh-21rem)] text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </TabsContent>
        <TabsContent value={OrderItemStatus.COMPLETED} className='h-[calc(100vh-25rem)]'>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.slug} className="grid gap-4 items-center w-full">
                <OrderItemDetail order={item} />
              </div>
            ))
          ) : (
            <p className="flex justify-center items-center h-[calc(100vh-21rem)] text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </TabsContent>
        <TabsContent value={OrderItemStatus.FAILED} className='h-[calc(100vh-25rem)]'>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.slug} className="grid gap-4 items-center w-full">
                <OrderItemDetail order={item} />
              </div>
            ))
          ) : (
            <p className="flex justify-center items-center h-[calc(100vh-21rem)] text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </TabsContent>
      </Tabs>

    </div>
  )
}
