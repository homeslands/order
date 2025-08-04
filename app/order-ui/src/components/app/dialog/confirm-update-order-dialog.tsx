import _ from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, MapPin, Notebook, Phone, Receipt, ShoppingCart, User, AlertTriangle, Plus, Minus, Edit3 } from 'lucide-react'

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from '@/components/ui'

import { ICartItem, OrderTypeEnum } from '@/types'
import { useAddNewOrderItem, useDeleteOrderItem, useUpdateOrderType, useUpdateOrderItem, useUpdateNoteOrderItem } from '@/hooks'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showErrorToast, showToast, transformOrderItemToOrderDetail } from '@/utils'
import { compareOrders, getChangesSummary } from '@/utils/order-comparison'
import { Role, ROUTE } from '@/constants'
import { useUserStore, useOrderFlowStore } from '@/stores'

interface IConfirmPlaceOrderDialogProps {
  onSuccess?: () => void
  disabled?: boolean | undefined
  onSuccessfulOrder?: () => void
}

export default function ConfirmUpdateOrderDialog({ disabled, onSuccessfulOrder, onSuccess }: IConfirmPlaceOrderDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { updatingData, clearAllData } = useOrderFlowStore()

  // Các hooks để update order
  const { mutate: updateOrderType, isPending: isPendingUpdateOrderType } = useUpdateOrderType()
  const { mutate: addNewOrderItem, isPending: isPendingAddNewOrderItem } = useAddNewOrderItem()
  const { mutate: deleteOrderItem, isPending: isPendingDeleteOrderItem } = useDeleteOrderItem()
  const { mutate: updateOrderItem, isPending: isPendingUpdateOrderItem } = useUpdateOrderItem()
  const { mutate: updateOrderItemNote, isPending: isPendingUpdateOrderItemNote } = useUpdateNoteOrderItem()

  const [isOpen, setIsOpen] = useState(false)
  const { userInfo } = useUserStore()

  // Get data from Order Flow Store
  const orderDraft = updatingData?.updateDraft
  const originalOrder = updatingData?.originalOrder
  // console.log('orderDraft in confirm update order dialog', originalOrder?.orderItems, orderDraft?.orderItems)

  // Convert orderDraft to ICartItem format for comparison
  const order: ICartItem | null = orderDraft ? {
    id: orderDraft.id,
    slug: orderDraft.slug,
    // productSlug: orderDraft.productSlug,
    owner: orderDraft.owner,
    ownerFullName: orderDraft.ownerFullName,
    ownerPhoneNumber: orderDraft.ownerPhoneNumber,
    ownerRole: orderDraft.ownerRole,
    type: orderDraft.type as string,
    orderItems: orderDraft.orderItems.map(item => ({
      ...item,
      slug: item.slug || item.id,
      productSlug: item.productSlug || item.slug,
    })),
    table: orderDraft.table,
    tableName: orderDraft.tableName,
    voucher: orderDraft.voucher,
    description: orderDraft.description,
    approvalBy: orderDraft.approvalBy,
    paymentMethod: orderDraft.paymentMethod,
  } : null



  // Convert originalOrder to ICartItem format for comparison
  const originalOrderForComparison: ICartItem | null = originalOrder ? {
    id: originalOrder.slug,
    slug: originalOrder.slug,
    owner: originalOrder.owner?.slug || '',
    ownerFullName: originalOrder.owner?.firstName || '',
    ownerPhoneNumber: originalOrder.owner?.phonenumber || '',
    ownerRole: originalOrder.owner?.role?.name || '',
    type: originalOrder.type,
    orderItems: originalOrder.orderItems.map(detail => ({
      id: detail.id || detail.slug,
      slug: detail.slug,
      productSlug: detail.variant.product.slug,
      image: detail.variant.product.image,
      name: detail.variant.product.name,
      quantity: detail.quantity,
      size: detail.variant.size.name,
      allVariants: detail.variant.product.variants,
      variant: detail.variant,
      originalPrice: detail.variant.price,
      promotion: detail.promotion ? detail.promotion : null,
      promotionValue: detail.promotion?.value || 0,
      description: detail.variant.product.description,
      isLimit: detail.variant.product.isLimit,
      note: detail.note || '',
    })),
    table: originalOrder.table?.slug || '',
    tableName: originalOrder.table?.name || '',
    voucher: originalOrder.voucher,
    description: originalOrder.description,
    approvalBy: originalOrder.approvalBy?.slug || '',
    paymentMethod: originalOrder.payment?.paymentMethod || '',
  } : null

  // console.log('order in confirm update order dialog', originalOrderForComparison?.orderItems, order?.orderItems)

  // So sánh orders để tìm thay đổi
  const orderComparison = compareOrders(originalOrderForComparison, order)
  // console.log('orderComparison', orderComparison)
  const changesSummary = getChangesSummary(orderComparison)
  // console.log('changesSummary', changesSummary)

  // Calculate display items and totals
  const transformedOrderItems = orderDraft ? transformOrderItemToOrderDetail(orderDraft.orderItems) : []
  const displayItems = calculateOrderItemDisplay(transformedOrderItems, orderDraft?.voucher || null)
  const orderTotals = calculatePlacedOrderTotals(displayItems, orderDraft?.voucher || null)

  // Check if any operation is pending
  const isAnyPending = isPendingUpdateOrderType || isPendingAddNewOrderItem ||
    isPendingDeleteOrderItem || isPendingUpdateOrderItem || isPendingUpdateOrderItemNote

  const handleSubmit = async () => {
    if (!orderDraft || !originalOrder) return

    try {
      // 1. Update order type/table/description if changed
      if (orderComparison.tableChanged || orderComparison.noteChanged) {
        await new Promise((resolve, reject) => {
          updateOrderType({
            slug: originalOrder.slug,
            params: {
              type: orderDraft.type,
              table: orderDraft.table || null,
              description: orderDraft.description || ''
            }
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // 2. Handle item changes
      const addedItems = orderComparison.itemChanges.filter(c => c.type === 'added')
      const removedItems = orderComparison.itemChanges.filter(c => c.type === 'removed')
      const quantityChangedItems = orderComparison.itemChanges.filter(c => c.type === 'quantity_changed')
      const orderItemNoteChangedItems = orderComparison.itemChanges.filter(c => c.type === 'orderItemNoteChanged')

      // Add new items
      for (const change of addedItems) {
        await new Promise((resolve, reject) => {
          addNewOrderItem({
            quantity: change.item.quantity,
            variant: change.item.variant.slug,
            note: change.item.note || '',
            promotion: change.item.promotion ? change.item.promotion.slug : '',
            order: originalOrder.slug
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // Remove items
      for (const change of removedItems) {
        if (!change.slug) continue
        await new Promise((resolve, reject) => {
          deleteOrderItem(change.slug!, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // Update quantity of existing items
      for (const change of quantityChangedItems) {
        if (!change.slug) continue
        const originalQuantity = change.originalQuantity || 0
        const newQuantity = change.newQuantity || 0
        const action = newQuantity > originalQuantity ? 'increment' : 'decrement'

        await new Promise((resolve, reject) => {
          updateOrderItem({
            slug: change.slug!,
            data: {
              quantity: change.item.quantity,
              note: change.item.note || '',
              variant: change.item.variant.slug,
              promotion: change.item.promotion || undefined,
              action: action,
            }
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // Update note of existing items
      for (const change of orderItemNoteChangedItems) {
        if (!change.slug) continue

        await new Promise((resolve, reject) => {
          updateOrderItemNote({
            slug: change.slug!,
            data: {
              note: change.item.note || '',
            }
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // Success - navigate to payment
      const orderPath = userInfo?.role.name === Role.CUSTOMER
        ? `${ROUTE.CLIENT_PAYMENT}?order=${originalOrder.slug}`
        : `${ROUTE.STAFF_ORDER_PAYMENT}?order=${originalOrder.slug}`

      onSuccess?.()
      navigate(orderPath)
      setIsOpen(false)
      onSuccessfulOrder?.()

      if (userInfo?.role.name === Role.CUSTOMER) {
        clearAllData()
      }

      showToast(tToast('toast.updateOrderSuccess'))

    } catch {
      showErrorToast(11000)
    }
  }

  const renderOrderChanges = () => {
    if (!orderComparison.hasChanges) {
      return (
        <div className="flex gap-2 items-center p-3 mb-4 bg-gray-50 rounded-md border border-gray-200">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {t('order.noChanges')}
          </span>
        </div>
      )
    }

    return (
      <div className="mb-4 space-y-2">
        <div className="flex gap-2 items-center p-3 bg-blue-50 rounded-md border border-blue-200">
          <Edit3 className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            <strong>{t('order.orderChanges')}:</strong> {changesSummary}
          </span>
        </div>

        {/* Hiển thị chi tiết thay đổi các items */}
        <div className="space-y-1 text-sm">
          {orderComparison.itemChanges.map((change, index) => {
            if (change.type === 'unchanged') return null

            return (
              <div key={index} className={`flex items-center gap-2 p-2 rounded ${change.type === 'added' ? 'bg-green-50 text-green-700' :
                change.type === 'removed' ? 'bg-red-50 text-red-700' :
                  change.type === 'orderItemNoteChanged' ? 'bg-purple-50 text-purple-700' :
                    'bg-yellow-50 text-yellow-700'
                }`}>
                {change.type === 'added' && <Plus className="w-3 h-3" />}
                {change.type === 'removed' && <Minus className="w-3 h-3" />}
                {change.type === 'quantity_changed' && <Edit3 className="w-3 h-3" />}
                {change.type === 'orderItemNoteChanged' && <Notebook className="w-3 h-3" />}

                <span className="flex-1">{change.item.name}</span>

                {change.type === 'added' && (
                  <span>+{change.item.quantity}</span>
                )}
                {change.type === 'removed' && (
                  <span>-{change.item.quantity}</span>
                )}
                {change.type === 'quantity_changed' && (
                  <span>SL: {change.originalQuantity} → {change.newQuantity}</span>
                )}
                {change.type === 'orderItemNoteChanged' && (
                  <span>Ghi chú đã thay đổi</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || isAnyPending}
          className="flex items-center w-full text-sm rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {isAnyPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {(order?.type === OrderTypeEnum.TAKE_OUT ||
            (order?.type === OrderTypeEnum.AT_TABLE && order.table))
            ? t('order.updateOrder')
            : t('menu.noSelectedTable')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md p-0 gap-0 sm:max-w-[48rem] h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
        <DialogHeader className="p-4 h-fit">
          <DialogTitle className="pb-2 border-b">
            <div className="flex gap-2 items-center">
              <div className="flex justify-center items-center p-1 w-8 h-8 rounded-lg bg-primary/20 text-primary">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              {t('order.updateOrder')}
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('order.confirmOrder')}
          </DialogDescription>
        </DialogHeader>

        {/* Order Items List */}
        <ScrollArea className="h-[calc(100vh-30rem)] sm:max-h-[calc(100vh-16rem)] px-4 flex flex-col gap-4">
          {/* Hiển thị thay đổi */}
          {renderOrderChanges()}

          {/* Order Info */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
              <span className="flex gap-2 items-center text-gray-600">
                <Receipt className="w-4 h-4" />
                {t('order.orderType')}
              </span>
              <Badge className={`shadow-none ${order?.type === OrderTypeEnum.AT_TABLE ? '' : 'bg-blue-500/20 text-blue-500'}`}>
                {order?.type === OrderTypeEnum.AT_TABLE ? t('menu.dineIn') : t('menu.takeAway')}
              </Badge>
            </div>
            {order?.tableName && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {t('menu.tableName')}
                </span>
                <span className="font-medium">{order.tableName}</span>
              </div>
            )}
            {order?.ownerFullName && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-gray-600">
                  <User className="w-4 h-4" />
                  {t('order.customer')}
                </span>
                <span className="font-medium">{order.ownerFullName}</span>
              </div>
            )}
            {order?.ownerPhoneNumber && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-gray-600">
                  <Phone className="w-4 h-4" />
                  {t('order.phoneNumber')}
                </span>
                <span className="font-medium">{order.ownerPhoneNumber}</span>
              </div>
            )}
            {order?.description && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-gray-600">
                  <Notebook className="w-4 h-4" />
                  {t('order.note')}
                </span>
                <span className="font-medium">{order.description}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 px-2 py-4 mt-6 border-t border-dashed border-muted-foreground/60">
            {order?.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex flex-col flex-1 gap-2">
                  <p className="font-bold">{item.name}</p>
                  <div className="flex gap-2">
                    <Badge className="text-xs text-muted-foreground w-fit" variant="outline">Size {item.size.toUpperCase()}</Badge>
                    <p className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </p>
                  </div>
                </div>
                {(() => {
                  const finalPrice = (displayItems.find(di => di.slug === item.slug)?.finalPrice ?? 0) * item.quantity
                  const original = (item.originalPrice ?? item.variant?.price ?? 0) * item.quantity

                  const hasDiscount = original > finalPrice

                  return (
                    <div className="flex relative gap-1 items-center">
                      {hasDiscount ? (
                        <>
                          <span className="mr-1 line-through text-muted-foreground/70">
                            {formatCurrency(original)}
                          </span>
                          <span className="font-bold text-primary">
                            {formatCurrency(finalPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-primary">
                          {formatCurrency(finalPrice)}
                        </span>
                      )}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 h-fit">
          {/* Total Amount */}
          <div className="flex flex-col gap-1 justify-start items-start w-full">
            <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
              {t('order.subtotal')}:&nbsp;
              <span>{`${formatCurrency(orderTotals?.subTotalBeforeDiscount || 0)}`}</span>
            </div>
            {(orderTotals?.promotionDiscount || 0) > 0 && (
              <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
                <span className="italic text-yellow-600">
                  {t('order.promotionDiscount')}:&nbsp;
                </span>
                <span className="italic text-yellow-600">
                  -{`${formatCurrency(orderTotals?.promotionDiscount || 0)}`}
                </span>
              </div>
            )}
            <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
              <span className="italic text-green-500">
                {t('order.voucher')}:&nbsp;
              </span>
              <span className="italic text-green-500">
                -{`${formatCurrency(orderTotals?.voucherDiscount || 0)}`}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center pt-2 mt-4 w-full font-semibold border-t text-md">
              <span>{t('order.totalPayment')}:&nbsp;</span>
              <span className="text-2xl font-extrabold text-primary">
                {`${formatCurrency(orderTotals?.finalTotal || 0)}`}
              </span>
            </div>
            <div className='flex flex-row gap-2 justify-end mt-4 w-full'>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 min-w-24"
                disabled={isAnyPending}
              >
                {tCommon('common.cancel')}
              </Button>
              <Button
                onClick={() => {
                  if (orderDraft) {
                    handleSubmit()
                  }
                }}
                disabled={isAnyPending}
              >
                {isAnyPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('order.updateOrder')}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
