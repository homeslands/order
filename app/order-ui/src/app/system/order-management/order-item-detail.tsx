import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckedState } from '@radix-ui/react-checkbox'
import { Clock, AlertCircle, CheckCircle2, Truck } from 'lucide-react'

import { ChefOrderItemStatus, IOrderDetail, OrderItemStatus } from '@/types'
import { Badge, Checkbox } from '@/components/ui'
import { useOrderTrackingStore } from '@/stores'
import OrderItemStatusBadge from '@/components/app/badge/order-item-status-badge'
import { formatCurrency } from '@/utils'

interface OrderItemDetailProps {
  order: IOrderDetail
}

export default function OrderItemDetail({ order }: OrderItemDetailProps) {
  const { t } = useTranslation(['menu'])
  const { addSelectedItem, removeSelectedItem, getSelectedItems } =
    useOrderTrackingStore()
  const [selectedIndexes, setSelectedIndexes] = useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    const selectedItems = getSelectedItems()
    const newSelectedIndexes: { [key: string]: boolean } = {}

    selectedItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const key = `${item.slug}-${i}`
        newSelectedIndexes[key] = false
      }
    })
    setSelectedIndexes(newSelectedIndexes)
  }, [getSelectedItems])

  const handleSelectOrderItem = (
    checked: CheckedState,
    orderItem: IOrderDetail,
    itemIndex: number,
  ) => {
    const key = `${orderItem.slug}-${itemIndex}`

    if (checked === true) {
      setSelectedIndexes((prev) => ({ ...prev, [key]: true }))
      const singleItem: IOrderDetail = {
        ...orderItem,
        quantity: 1,
        subtotal: orderItem.promotion && orderItem.promotion.value ? orderItem.variant.price * (1 - orderItem.promotion.value / 100) : orderItem.variant.price,
        slug: orderItem.slug,
        index: itemIndex,
        id: orderItem.id!,
      }
      addSelectedItem(singleItem)
    } else {
      setSelectedIndexes((prev) => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
      removeSelectedItem(`${orderItem.slug}-${itemIndex}`)
    }
  }

  const isChecked = (orderItem: IOrderDetail, index: number) => {
    const key = `${orderItem.slug}-${index}`
    return !!selectedIndexes[key]
  }

  const originalPrice = order.variant.price

  const priceAfterDiscount = order.promotion && order.promotion.value
    ? order.variant.price * (1 - order.promotion.value / 100)
    : order.variant.price

  const renderDeliveryTimeline = (orderItem: IOrderDetail) => {
    const noCompletedItems = orderItem.chefOrderItems?.filter(item => item.status === ChefOrderItemStatus.PENDING).length || 0
    const cookingItems = orderItem.chefOrderItems?.filter(item => item.status === ChefOrderItemStatus.IN_PROGRESS).length || 0
    const cookedItems = orderItem.chefOrderItems?.filter(item => item.status === ChefOrderItemStatus.COMPLETED).length || 0
    const deliveredItems = orderItem.trackingOrderItems.filter(item => item.tracking.status === 'COMPLETED').length

    return (
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">{t('order.deliveryStatus')}</h3>
        </div>

        <div className="relative">
          <div className="absolute top-[34px] left-0 w-full h-0.5 bg-gray-200 "></div>
          <div className="flex relative justify-between">
            <div className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${noCompletedItems > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <Clock className={`w-4 h-4 ${noCompletedItems > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{t('order.pending')}</span>
              <span className="text-xs text-gray-500">{noCompletedItems} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cookingItems > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <AlertCircle className={`w-4 h-4 ${cookingItems > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{t('order.cooking')}</span>
              <span className="text-xs text-gray-500">{cookingItems} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cookedItems > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle2 className={`w-4 h-4 ${cookedItems > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{t('order.ready')}</span>
              <span className="text-xs text-gray-500">{cookedItems} {t('order.items')}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deliveredItems > 0 ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Truck className={`w-4 h-4 ${deliveredItems > 0 ? 'text-purple-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{t('order.delivered')}</span>
              <span className="text-xs text-gray-500">{deliveredItems} {t('order.items')}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderOrderItem = (orderItem: IOrderDetail) => {
    const items = Array(orderItem.quantity)
      .fill(null)
      .map((_, index) => {
        // Get current status
        let currentStatus = OrderItemStatus.PENDING
        if (index < orderItem.status.COMPLETED) {
          currentStatus = OrderItemStatus.COMPLETED
        } else if (index < orderItem.status.COMPLETED + orderItem.status.RUNNING) {
          currentStatus = OrderItemStatus.RUNNING
        } else if (index < orderItem.status.COMPLETED + orderItem.status.RUNNING + orderItem.status.FAILED) {
          currentStatus = OrderItemStatus.FAILED
        }

        // Get chefOrderItems status
        const chefOrderItem = orderItem.chefOrderItems?.[index]
        let chefStatus = OrderItemStatus.PENDING
        if (chefOrderItem) {
          chefStatus = chefOrderItem.status === ChefOrderItemStatus.COMPLETED
            ? OrderItemStatus.COMPLETED
            : chefOrderItem.status === ChefOrderItemStatus.IN_PROGRESS
              ? OrderItemStatus.RUNNING
              : OrderItemStatus.PENDING
        }

        return {
          status: currentStatus,
          chefStatus,
          index
        }
      })

    return (
      <div key={orderItem.id} className="mt-4 space-y-4">
        {/* Delivery Timeline */}
        {renderDeliveryTimeline(orderItem)}

        {/* Product Information */}
        <div className="flex flex-col gap-3 py-4 px-2 sm:px-4 bg-white rounded-lg border shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Badge className="h-9 text-md bg-primary/10 text-primary hover:bg-primary/10">
                <span className='overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[800px]'>
                  {orderItem.variant.product.name}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                Size {orderItem.variant.size?.name.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Order Note */}
          {orderItem.note && (
            <div className="flex gap-2 items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm font-semibold text-gray-600">
                {t('order.note')}:
              </span>
              <span className="text-sm text-gray-600">
                {orderItem.note}
              </span>
            </div>
          )}

          {/* Order Items List */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.index}
                className="flex flex-wrap items-center px-1 py-3 bg-gray-50 border-b-2 border-gray-200 last:border-b-0 sm:border-b-0"
              >
                <div className='w-full sm:w-1/2 flex justify-between'>
                  <div className="flex gap-3 items-center">
                    {item.chefStatus === OrderItemStatus.COMPLETED ?
                      (item.status === OrderItemStatus.PENDING || item.status === OrderItemStatus.FAILED ? (
                        <Checkbox
                          className="w-5 h-5 shadow-none"
                          checked={isChecked(orderItem, item.index)}
                          onCheckedChange={(checked) =>
                            handleSelectOrderItem(checked, orderItem, item.index)
                          }
                        />
                      ) :
                        (
                          <div
                            className={`h-3 w-3 rounded-full ${item.status === OrderItemStatus.COMPLETED
                              ? 'bg-green-500'
                              : item.status === OrderItemStatus.RUNNING
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                              }`}
                          />
                        )
                      )
                      :
                      (<div className={`h-3 w-3 rounded-full ${item.status === OrderItemStatus.COMPLETED
                        ? 'bg-green-500'
                        : item.status === OrderItemStatus.RUNNING
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                        }`}
                      />
                      )}
                    <span className="text-sm font-medium text-gray-700 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {orderItem.variant.product.name}
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    {orderItem.promotion && orderItem.promotion.value > 0 ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(priceAfterDiscount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end items-center w-full sm:w-1/2 mt-2 sm:mt-0">
                  <OrderItemStatusBadge status={item.status} rounded='md' />
                  {item.chefStatus === OrderItemStatus.PENDING && (
                    <Badge className="text-xs bg-gray-200 text-gray-700">
                      {t('order.waitingForKitchen')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    order.trackingOrderItems.forEach((trackingItem, index) => {
      if (trackingItem.tracking.status === 'FAILED') {
        setSelectedIndexes((prev) => {
          const updated = { ...prev }
          delete updated[`${order.slug}-${index}`]
          return updated
        })
      }
    })
  }, [order])

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderOrderItem(order)}
    </div>
  )
}
