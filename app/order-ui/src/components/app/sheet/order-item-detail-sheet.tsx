import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CustomerInformation,
  OrderItemList,
} from '@/app/system/order-management'
import {
  useExportOrderInvoice,
  useOrderBySlug,
} from '@/hooks'
import { useOrderTrackingStore, useSelectedOrderStore } from '@/stores'
import { OrderTypeEnum } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  SheetFooter,
  ScrollArea,
} from '@/components/ui'
import {
  CreateOrderTrackingByStaffDialog,
  // CreateOrderTrackingByRobotDialog,
} from '@/components/app/dialog'
import { paymentStatus } from '@/constants'
import { loadDataToPrinter, showToast } from '@/utils'
import { ButtonLoading } from '../loading'
import { useSearchParams } from 'react-router-dom'
import { OrderInformationAccordion } from '../accordion'

interface IOrderItemDetailSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function OrderItemDetailSheet({
  isOpen,
  onClose,
}: IOrderItemDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const { t } = useTranslation(['menu'])
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const {
    setOrderSlug,
    orderSlug,
  } = useSelectedOrderStore()
  // const { userInfo } = useUserStore()
  // const { pagination } = usePagination()
  // const [shouldFetchOrders, setShouldFetchOrders] = useState(false)
  // const [orderSlugs, setOrderSlugs] = useState<string[]>([])
  // const [orderDetails, setOrderDetails] = useState<IOrder[]>([])
  // const [currentFetchIndex, setCurrentFetchIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const { getSelectedItems } = useOrderTrackingStore()
  const { mutate: exportOrderInvoice, isPending } = useExportOrderInvoice()

  // Polling: main order
  const { data: selectedOrder, refetch: refetchSelectedOrder } = useOrderBySlug(
    orderSlug,
    {
      enabled: !!orderSlug,
    },
  )

  const handleSubmit = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    setOrderSlug(slug)
  }, [slug, setOrderSlug])

  useEffect(() => {
    if (!orderSlug) return
    const interval = setInterval(async () => {
      try {
        await refetchSelectedOrder()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 5000) // Polling mỗi 5 giây

    return () => clearInterval(interval) // Cleanup
  }, [orderSlug, refetchSelectedOrder])

  // Get list of orders in the same table
  // const { data: ordersInTheSameTable, refetch: allOrderRefetch } = useOrders({
  //   page: pagination.pageIndex,
  //   size: pagination.pageSize,
  //   owner: userInfo?.slug,
  //   order: 'DESC',
  //   branchSlug: userInfo?.branch?.slug,
  //   table: selectedOrder?.result?.table?.slug,
  //   hasPaging: false,
  //   enabled: shouldFetchOrders && !!selectedOrder?.result?.table?.slug,
  //   status: [OrderStatus.PAID, OrderStatus.SHIPPING, OrderStatus.FAILED].join(
  //     ',',
  //   ),
  // })

  // useEffect(() => {
  //   const slugs =
  //     ordersInTheSameTable?.result?.items?.map((item) => item.slug) || []
  //   setOrderSlugs(slugs)
  // }, [ordersInTheSameTable])

  // Fetch each order from the list of orders in the same table
  // const { data: currentOrderDetail } = useOrderBySlug(
  //   shouldFetchOrders && orderSlugs[currentFetchIndex]
  //     ? orderSlugs[currentFetchIndex]
  //     : '',
  //   {
  //     enabled:
  //       shouldFetchOrders &&
  //       currentFetchIndex < orderSlugs.length &&
  //       orderSlugs[currentFetchIndex] !== orderSlug,
  //   },
  // )

  // useEffect(() => {
  //   if (currentOrderDetail?.result) {
  //     setOrderDetails((prev) => {
  //       const exists = prev.some(
  //         (detail) => detail.slug === currentOrderDetail.result.slug,
  //       )
  //       if (!exists) {
  //         return [...prev, currentOrderDetail.result]
  //       }
  //       return prev.map((detail) =>
  //         detail.slug === currentOrderDetail.result.slug
  //           ? currentOrderDetail.result
  //           : detail,
  //       )
  //     })

  //     setCurrentFetchIndex((prevIndex) => {
  //       const nextIndex = prevIndex + 1
  //       return nextIndex < orderSlugs.length ? nextIndex : prevIndex
  //     })
  //   }
  // }, [currentOrderDetail, orderSlugs.length])

  // useEffect(() => {
  //   // When the order changes, clear the old data
  //   // setOrderDetails([])
  //   setShouldFetchOrders(false)
  //   // setCurrentFetchIndex(0)
  //   clearSelectedItems()
  // }, [clearSelectedItems, orderSlug])

  // const handleFetchOrders = () => {
  //   setShouldFetchOrders(true)
  //   clearSelectedItems()
  //   setOrderDetails([])
  //   setCurrentFetchIndex(0)
  // }

  // const handleRefetchAll = async () => {
  //   setOrderDetails([])
  //   clearSelectedItems()
  //   setCurrentFetchIndex(0)
  //   await allOrderRefetch()
  // }

  const handleExportOrderInvoice = (slug: string) => {
    exportOrderInvoice(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  // useEffect(() => {
  //   if (!shouldFetchOrders) return

  //   const interval = setInterval(async () => {
  //     try {
  //       await allOrderRefetch()
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (error) {
  //       /* empty */
  //     }
  //   }, 3000)

  //   return () => clearInterval(interval)
  // }, [shouldFetchOrders])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] p-0 flex flex-col gap-0 max-h-screen">
        <SheetHeader className="px-2">
          <SheetTitle className="flex flex-wrap justify-start items-center mt-8">
            <div className="flex gap-2 w-full">
              {selectedOrder?.result?.type === OrderTypeEnum.TAKE_OUT ? (
                <div className='flex flex-col gap-2 mt-2 w-full'>
                  <div className='flex gap-2 justify-between items-center'>
                    <CreateOrderTrackingByStaffDialog disabled={getSelectedItems().length === 0} />
                    <div className='flex gap-2'>
                      {selectedOrder &&
                        selectedOrder.result.payment?.statusCode ===
                        paymentStatus.COMPLETED && (
                          <Button
                            onClick={() =>
                              handleExportOrderInvoice(selectedOrder.result.slug)
                            }
                            disabled={isPending}
                            className="flex justify-start items-center px-2 text-xs shadow-none sm:text-sm"
                          >
                            {isPending && <ButtonLoading />}
                            {t('order.exportInvoice')}
                          </Button>
                        )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 p-2 w-full rounded-lg border-2 border-primary bg-primary/5 sm:p-4'>
                    <div className="text-sm font-medium text-primary">
                      {t('order.currentOrder')} #{selectedOrder?.result?.slug}
                    </div>
                    <CustomerInformation orderDetailData={selectedOrder?.result} />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-3 w-full'>
                  <div className="flex gap-2 justify-between mt-2">
                    <div className="flex gap-2">
                      <CreateOrderTrackingByStaffDialog disabled={getSelectedItems().length === 0} />
                      {/* <CreateOrderTrackingByRobotDialog disabled={getSelectedItems().length === 0} /> */}
                    </div>
                    <div>
                      {selectedOrder &&
                        selectedOrder.result.payment?.statusCode ===
                        paymentStatus.COMPLETED && (
                          <Button
                            onClick={() =>
                              handleExportOrderInvoice(selectedOrder.result.slug)
                            }
                            disabled={isPending}
                            className="flex justify-start items-center px-2 text-xs shadow-none sm:text-sm"
                          >
                            {isPending && <ButtonLoading />}
                            {t('order.exportInvoice')}
                          </Button>
                        )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 p-2 w-full rounded-lg border-2 border-primary bg-primary/5 sm:p-4'>
                    <div className="text-sm font-medium text-primary">
                      {t('order.currentOrder')} #{selectedOrder?.result?.slug}
                    </div>
                    <CustomerInformation orderDetailData={selectedOrder?.result} />
                    {selectedOrder?.result && (
                      <OrderInformationAccordion onSubmit={handleSubmit} orderDetailData={selectedOrder?.result} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-11rem)]">
          {orderSlug ? (
            <div className="flex-1 px-2 pt-2">
              <OrderItemList orderDetailData={selectedOrder?.result} />
              {/* {orderDetails && orderDetails.length > 0 && (
              <div className="flex gap-1 items-center">
                <CircleAlert size={14} className="text-blue-500" />
                <span className="text-xs text-muted-foreground sm:text-sm">
                  {t('order.refreshOrdersInTheSameTable')}
                </span>
              </div>
            )} */}
              {/* <div className="flex justify-start">
              <Button
                onClick={
                  shouldFetchOrders ? handleRefetchAll : handleFetchOrders
                }
              >
                {shouldFetchOrders
                  ? t('order.refresh')
                  : t('order.loadOrdersInTheSameTable')}
              </Button>
            </div> */}
              {/* {shouldFetchOrders && (
              <div className="flex flex-col gap-4">
                {orderDetails
                  .filter((orderDetail) => orderDetail.slug !== orderSlug)
                  .map((orderDetail) => (
                    <div
                      key={orderDetail.slug}
                      className="flex flex-col gap-2 p-4 rounded-lg border"
                    >
                      <CustomerInformation orderDetailData={orderDetail} />
                      <OrderItemList orderDetailData={orderDetail} />
                    </div>
                  ))}
              </div>
            )} */}
            </div>
          ) : (
            <p className="flex min-h-[calc(100vh-21rem)] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </ScrollArea>

        <SheetFooter className="p-2">
          <Button onClick={onClose}>
            {t('order.close')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
