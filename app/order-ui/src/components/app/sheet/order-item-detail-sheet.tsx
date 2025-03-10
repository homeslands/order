import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleAlert, DownloadIcon } from 'lucide-react'

import {
  CustomerInformation,
  OrderItemList,
} from '@/app/system/order-management'
import {
  useExportOrderInvoice,
  useOrderBySlug,
  useOrders,
  usePagination,
} from '@/hooks'
import { useOrderTrackingStore, useUserStore } from '@/stores'
import { IOrder, OrderTypeEnum, OrderStatus } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
} from '@/components/ui'
import {
  CreateOrderTrackingByStaffDialog,
  CreateOrderTrackingByRobotDialog,
} from '@/components/app/dialog'
import { paymentStatus } from '@/constants'
import { loadDataToPrinter, showToast } from '@/utils'
import { ButtonLoading } from '../loading'

interface IOrderItemDetailSheetProps {
  order: string
  isOpen: boolean
  onClose: () => void
}

export default function OrderItemDetailSheet({
  order,
  isOpen,
  onClose,
}: IOrderItemDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const { t } = useTranslation(['menu'])
  const { userInfo } = useUserStore()
  const { pagination } = usePagination()
  const [shouldFetchOrders, setShouldFetchOrders] = useState(false)
  const [orderSlugs, setOrderSlugs] = useState<string[]>([])
  const [orderDetails, setOrderDetails] = useState<IOrder[]>([])
  const [currentFetchIndex, setCurrentFetchIndex] = useState(0)
  const { getSelectedItems, clearSelectedItems } = useOrderTrackingStore()
  const { mutate: exportOrderInvoice, isPending } = useExportOrderInvoice()

  // Polling: Order chính
  const { data: selectedOrder, refetch: refetchSelectedOrder } = useOrderBySlug(
    order,
    {
      enabled: !!order,
    },
  )

  useEffect(() => {
    if (!order) return
    const interval = setInterval(async () => {
      try {
        await refetchSelectedOrder()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 5000) // Polling mỗi 5 giây

    return () => clearInterval(interval) // Cleanup
  }, [order, refetchSelectedOrder])

  // Lấy danh sách orders cùng bàn
  const { data: ordersInTheSameTable, refetch: allOrderRefetch } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    owner: userInfo?.slug,
    order: 'DESC',
    branchSlug: userInfo?.branch.slug,
    table: selectedOrder?.result?.table?.slug,
    hasPaging: false,
    enabled: shouldFetchOrders && !!selectedOrder?.result?.table?.slug,
    status: [OrderStatus.PAID, OrderStatus.SHIPPING, OrderStatus.FAILED].join(
      ',',
    ),
  })

  useEffect(() => {
    const slugs =
      ordersInTheSameTable?.result?.items?.map((item) => item.slug) || []
    setOrderSlugs(slugs)
  }, [ordersInTheSameTable])

  // Fetch từng order từ danh sách orders cùng bàn
  const { data: currentOrderDetail } = useOrderBySlug(
    shouldFetchOrders && orderSlugs[currentFetchIndex]
      ? orderSlugs[currentFetchIndex]
      : '',
    {
      enabled:
        shouldFetchOrders &&
        currentFetchIndex < orderSlugs.length &&
        orderSlugs[currentFetchIndex] !== order,
    },
  )

  useEffect(() => {
    if (currentOrderDetail?.result) {
      setOrderDetails((prev) => {
        const exists = prev.some(
          (detail) => detail.slug === currentOrderDetail.result.slug,
        )
        if (!exists) {
          return [...prev, currentOrderDetail.result]
        }
        return prev.map((detail) =>
          detail.slug === currentOrderDetail.result.slug
            ? currentOrderDetail.result
            : detail,
        )
      })

      setCurrentFetchIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        return nextIndex < orderSlugs.length ? nextIndex : prevIndex
      })
    }
  }, [currentOrderDetail, orderSlugs.length])

  useEffect(() => {
    // Khi order thay đổi, xóa dữ liệu cũ
    setOrderDetails([])
    setShouldFetchOrders(false)
    setCurrentFetchIndex(0)
    clearSelectedItems()
  }, [clearSelectedItems, order])

  const handleFetchOrders = () => {
    setShouldFetchOrders(true)
    clearSelectedItems()
    setOrderDetails([])
    setCurrentFetchIndex(0)
  }

  const handleRefetchAll = async () => {
    setOrderDetails([])
    clearSelectedItems()
    setCurrentFetchIndex(0)
    await allOrderRefetch()
  }

  const handleExportOrderInvoice = (slug: string) => {
    exportOrderInvoice(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  useEffect(() => {
    if (!shouldFetchOrders) return

    const interval = setInterval(async () => {
      try {
        await allOrderRefetch()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [shouldFetchOrders, allOrderRefetch])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] overflow-y-auto p-2">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between mt-8">
            {t('order.orderDetail')}
            <div className="flex gap-2">
              {selectedOrder?.result?.type === OrderTypeEnum.TAKE_OUT ? (
                <CreateOrderTrackingByStaffDialog disabled={getSelectedItems().length === 0} />
              ) : (
                <div className="flex gap-2">
                  <CreateOrderTrackingByStaffDialog disabled={getSelectedItems().length === 0} />
                  <CreateOrderTrackingByRobotDialog disabled={getSelectedItems().length === 0} />
                </div>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {order ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-2 border-2 rounded-lg border-primary bg-primary/5 sm:p-4">
                <div className="flex justify-between font-medium text-primary">
                  {t('order.currentOrder')} #{selectedOrder?.result?.slug}
                  {selectedOrder &&
                    selectedOrder.result.payment?.statusCode ===
                    paymentStatus.COMPLETED && (
                      <Button
                        onClick={() =>
                          handleExportOrderInvoice(selectedOrder.result.slug)
                        }
                        disabled={isPending}
                        className="flex items-center justify-start px-2 shadow-none"
                      >
                        {isPending && <ButtonLoading />}
                        <DownloadIcon />
                        {t('order.exportInvoice')}
                      </Button>
                    )}
                </div>
                <CustomerInformation orderDetailData={selectedOrder?.result} />
                <OrderItemList orderDetailData={selectedOrder?.result} />
              </div>
              {orderDetails && orderDetails.length > 0 && (
                <div className="flex items-center gap-1">
                  <CircleAlert size={14} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {t('order.refreshOrdersInTheSameTable')}
                  </span>
                </div>
              )}
              <div className="flex justify-start">
                <Button
                  onClick={
                    shouldFetchOrders ? handleRefetchAll : handleFetchOrders
                  }
                >
                  {shouldFetchOrders
                    ? t('order.refresh')
                    : t('order.loadOrdersInTheSameTable')}
                </Button>
              </div>
              {shouldFetchOrders && (
                <div className="flex flex-col gap-4">
                  {orderDetails
                    .filter((orderDetail) => orderDetail.slug !== order)
                    .map((orderDetail) => (
                      <div
                        key={orderDetail.slug}
                        className="flex flex-col gap-2 p-4 border rounded-lg"
                      >
                        <CustomerInformation orderDetailData={orderDetail} />
                        <OrderItemList orderDetailData={orderDetail} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
