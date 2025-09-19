import _ from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, Loader2, MapPin, Notebook, Phone, Receipt, ShoppingCart, User } from 'lucide-react'

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
import { useUpdateOrderType, useUpdateOrderItem, useUpdateNoteOrderItem } from '@/hooks'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showErrorToast, showToast, transformOrderItemToOrderDetail } from '@/utils'
import { compareOrders } from '@/utils/order-comparison'
import { APPLICABILITY_RULE, Role, ROUTE, VOUCHER_TYPE } from '@/constants'
import { useUserStore, useOrderFlowStore } from '@/stores'

interface IClientConfirmUpdateOrderDialogProps {
  disabled?: boolean | undefined
  onSuccessfulOrder?: () => void
}

export default function ClientConfirmUpdateOrderDialog({ disabled, onSuccessfulOrder }: IClientConfirmUpdateOrderDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { updatingData, clearAllData } = useOrderFlowStore()

  // Các hooks để update order
  const { mutate: updateOrderType, isPending: isPendingUpdateOrderType } = useUpdateOrderType()
  const { mutate: updateOrderItem, isPending: isPendingUpdateOrderItem } = useUpdateOrderItem()
  const { mutate: updateOrderItemNote, isPending: isPendingUpdateOrderItemNote } = useUpdateNoteOrderItem()

  const [isOpen, setIsOpen] = useState(false)
  const { userInfo } = useUserStore()

  // Get data from Order Flow Store
  const orderDraft = updatingData?.updateDraft
  const originalOrder = updatingData?.originalOrder
  const voucher = updatingData?.updateDraft?.voucher || null
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
    timeLeftTakeOut: orderDraft.timeLeftTakeOut,
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
    timeLeftTakeOut: originalOrder.timeLeftTakeOut,
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

  // So sánh orders để tìm thay đổi
  const orderComparison = compareOrders(originalOrderForComparison, order)

  // Calculate display items and totals
  const transformedOrderItems = orderDraft ? transformOrderItemToOrderDetail(orderDraft.orderItems) : []
  const displayItems = calculateOrderItemDisplay(transformedOrderItems, orderDraft?.voucher || null)
  const orderTotals = calculatePlacedOrderTotals(displayItems, orderDraft?.voucher || null)

  // Check if any operation is pending
  const isAnyPending = isPendingUpdateOrderType || isPendingUpdateOrderItem || isPendingUpdateOrderItemNote

  const handleSubmit = async () => {
    if (!orderDraft || !originalOrder) return

    try {
      // 1. Update order type/table/description/pickup time if changed
      if (orderComparison.tableChanged || orderComparison.noteChanged || orderComparison.pickupTimeChanged) {
        await new Promise((resolve, reject) => {
          updateOrderType({
            slug: originalOrder.slug,
            params: {
              type: orderDraft.type,
              table: orderDraft.table || null,
              description: orderDraft.description || '',
              timeLeftTakeOut: orderDraft.timeLeftTakeOut || 0
            }
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // 2. Handle item changes  
      // NOTE: Không cần add new items ở đây vì đã được add qua API khi click add trong menu
      const quantityChangedItems = orderComparison.itemChanges.filter(c => c.type === 'quantity_changed')
      const orderItemNoteChangedItems = orderComparison.itemChanges.filter(c => c.type === 'orderItemNoteChanged')

      // Xử lý món mới có note: từ type 'added' chuyển thành update note
      const addedItemsWithNote = orderComparison.itemChanges
        .filter(c => c.type === 'added' && c.note && c.note.trim() !== '')
        .map(change => ({
          // Tìm item trong updateDraft để lấy slug thật từ API response
          ...change,
          type: 'orderItemNoteChanged' as const,
          slug: change.item.slug || change.item.id
        }))

      // Gộp với orderItemNoteChangedItems
      const allNoteChangedItems = [...orderItemNoteChangedItems, ...addedItemsWithNote]


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
              promotion: change.item.promotion ? change.item.promotion.slug : '',
              action: action
            }
          }, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          })
        })
      }

      // Update note của tất cả items (bao gồm cả món mới có note)
      for (const change of allNoteChangedItems) {
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
          {/* {renderOrderChanges()} */}

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
            {order?.timeLeftTakeOut !== undefined && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-gray-600">
                  <Clock className="w-4 h-4" />
                  {t('menu.pickupTime')}
                </span>
                <Badge className="font-medium">{order.timeLeftTakeOut === 0 ? t('menu.immediately') : `${order.timeLeftTakeOut} ${t('menu.minutes')}`}</Badge>
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
            {order?.orderItems.map((item, index) => {
              const displayItem = displayItems.find(di => di.slug === item.slug)
              const original = item.originalPrice || 0
              const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
              const finalPrice = displayItem?.finalPrice || 0

              const isSamePriceVoucher =
                voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                voucher?.voucherProducts?.some(vp => vp.product?.slug === item.productSlug)

              // const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

              const isAtLeastOneVoucher =
                voucher?.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED &&
                voucher?.voucherProducts?.some(vp => vp.product?.slug === item.productSlug)

              const hasVoucherDiscount = (displayItem?.voucherDiscount ?? 0) > 0
              const hasPromotionDiscount = (displayItem?.promotionDiscount ?? 0) > 0
              // finalPrice là giá cuối cùng hiển thị trên UI
              const displayPrice = isSamePriceVoucher
                ? finalPrice // đồng giá
                : isAtLeastOneVoucher && hasVoucherDiscount
                  ? original - (displayItem?.voucherDiscount || 0)
                  : hasPromotionDiscount
                    ? priceAfterPromotion
                    : original

              const shouldShowLineThrough =
                (isSamePriceVoucher || hasPromotionDiscount || hasVoucherDiscount) &&
                (original > displayPrice)
              const totalDisplayPrice = displayPrice * item.quantity
              const totalOriginalPrice = original * item.quantity

              return (
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
                  <div className="flex relative gap-1 items-center">
                    {shouldShowLineThrough && totalOriginalPrice !== totalDisplayPrice ? (
                      <>
                        <span className="mr-1 line-through text-muted-foreground/70">
                          {formatCurrency(totalOriginalPrice)}
                        </span>
                        <span className="font-bold text-primary">
                          {formatCurrency(totalDisplayPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary">
                        {formatCurrency(totalDisplayPrice)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
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
