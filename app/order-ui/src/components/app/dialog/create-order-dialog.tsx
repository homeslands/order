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

import { ICreateOrderRequest, OrderTypeEnum } from '@/types'
import { useCreateOrder, useCreateOrderWithoutLogin } from '@/hooks'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, showErrorToast, showToast } from '@/utils'
import { Role, ROUTE, PHONE_NUMBER_REGEX } from '@/constants'
import { useUserStore, useBranchStore, useUpdateOrderStore, useOrderFlowStore, IOrderingData } from '@/stores'

interface IPlaceOrderDialogProps {
  onSuccess?: () => void
  disabled?: boolean | undefined
  onSuccessfulOrder?: () => void
}

export default function PlaceOrderDialog({ disabled, onSuccessfulOrder, onSuccess }: IPlaceOrderDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { orderingData, transitionToPayment } = useOrderFlowStore()
  const { clearStore: clearUpdateOrderStore } = useUpdateOrderStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const { mutate: createOrderWithoutLogin, isPending: isPendingWithoutLogin } = useCreateOrderWithoutLogin()
  const [isOpen, setIsOpen] = useState(false)
  const { getUserInfo, userInfo } = useUserStore()
  const { branch } = useBranchStore()

  const order = orderingData

  const displayItems = calculateCartItemDisplay(
    order,
    order?.voucher || null
  )

  const cartTotals = calculateCartTotals(displayItems, order?.voucher || null)

  // console.log('cartTotals', cartTotals)

  const handleSubmit = (order: IOrderingData) => {
    if (!order) return

    const selectedBranch =
      userInfo
        ? (userInfo?.role.name === Role.CUSTOMER
          ? branch?.slug
          : userInfo?.branch?.slug)
        : branch?.slug

    if (!selectedBranch) {
      showErrorToast(11000)
      return
    }

    // Validate delivery case
    if (order.type === OrderTypeEnum.DELIVERY) {
      const phoneOk = !!order.deliveryPhone && PHONE_NUMBER_REGEX.test(order.deliveryPhone)
      if (!order.deliveryAddress || !phoneOk) {
        showErrorToast(119000)
        return
      }
    }

    const createOrderRequest: ICreateOrderRequest = {
      type: order.type,
      timeLeftTakeOut: order.timeLeftTakeOut || 0,
      deliveryTo: order.deliveryPlaceId || '',
      deliveryPhone: order.deliveryPhone || '',
      table: order.table || '',
      branch: selectedBranch,
      owner: order.owner || getUserInfo()?.slug || '',
      approvalBy: getUserInfo()?.slug || '',
      orderItems: order.orderItems.map((orderItem) => {
        return {
          quantity: orderItem.quantity,
          variant: orderItem.variant.slug,
          promotion: orderItem.promotion ? orderItem.promotion.slug : null,
          note: orderItem.note || '',
        }
      }),
      voucher: order.voucher?.slug || null,
      description: order.description || '',
    }

    // Call API to create order
    if (userInfo) {
      createOrder(createOrderRequest, {
        onSuccess: (data) => {
          const orderPath =
            userInfo?.role.name === Role.CUSTOMER
              ? `${ROUTE.CLIENT_PAYMENT}?order=${data.result.slug}`
              : `${ROUTE.STAFF_ORDER_PAYMENT}?order=${data.result.slug}`

          onSuccess?.()

          // ✅ Chuyển sang payment phase với order slug
          transitionToPayment(data.result.slug)

          navigate(orderPath)
          setIsOpen(false)
          onSuccessfulOrder?.()
          clearUpdateOrderStore()
          showToast(tToast('toast.createOrderSuccess'))
        },
      })
    } else {
      createOrderWithoutLogin(createOrderRequest, {
        onSuccess: (data) => {
          onSuccess?.()

          // ✅ Chuyển sang payment phase với order slug
          transitionToPayment(data.result.slug)

          navigate(`${ROUTE.CLIENT_PAYMENT}?order=${data.result.slug}`)
          setIsOpen(false)
          onSuccessfulOrder?.()
          clearUpdateOrderStore()
          showToast(tToast('toast.createOrderSuccess'))
        },
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || isPending || isPendingWithoutLogin}
          className="flex items-center w-full text-sm rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {isPending || isPendingWithoutLogin && <Loader2 className="w-4 h-4 animate-spin" />}
          {(() => {
            if (order?.type === OrderTypeEnum.AT_TABLE) {
              return order?.table ? t('order.create') : t('menu.noSelectedTable')
            }
            if (order?.type === OrderTypeEnum.DELIVERY) {
              const phoneOk = !!order.deliveryPhone && PHONE_NUMBER_REGEX.test(order.deliveryPhone)
              return order?.deliveryAddress && phoneOk ? t('order.create') : t('menu.deliveryInfoMissing')
            }
            return t('order.create')
          })()}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md p-0 gap-0 sm:max-w-[48rem] h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
        <DialogHeader className="p-4 h-fit">
          <DialogTitle className="pb-2 border-b">
            <div className="flex gap-2 items-center">
              <div className="flex justify-center items-center p-1 w-8 h-8 rounded-lg bg-primary/20 text-primary">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              {t('order.create')}
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('order.confirmOrder')}
          </DialogDescription>
        </DialogHeader>

        {/* Order Items List */}
        <ScrollArea className="h-[calc(100vh-30rem)] sm:max-h-[calc(100vh-16rem)] px-4 flex flex-col gap-4">
          {/* Order Info */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
              <span className="flex gap-2 items-center text-muted-foreground">
                <Receipt className="w-4 h-4" />
                {t('order.orderType')}
              </span>
              <Badge className={`shadow-none ${order?.type === OrderTypeEnum.AT_TABLE ? '' : 'bg-blue-500/20 text-blue-500'}`}>
                {order?.type === OrderTypeEnum.AT_TABLE ? t('menu.dineIn') : order?.type === OrderTypeEnum.DELIVERY ? t('menu.delivery') : t('menu.takeAway')}
              </Badge>
            </div>
            {order?.timeLeftTakeOut !== undefined && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {t('menu.pickupTime')}
                </span>
                <Badge className="font-medium">
                  {order.timeLeftTakeOut === 0
                    ? t('menu.immediately')
                    : `${order.timeLeftTakeOut} ${t('menu.minutes')}`}
                </Badge>
              </div>
            )}
            {order?.tableName && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {t('menu.tableName')}
                </span>
                <span className="font-medium">{order.tableName}</span>
              </div>
            )}
            {order?.type === OrderTypeEnum.DELIVERY && order?.deliveryAddress && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {t('menu.deliveryAddress')}
                </span>
                <span className="font-medium text-right max-w-[60%] truncate">{order.deliveryAddress}</span>
              </div>
            )}
            {order?.type === OrderTypeEnum.DELIVERY && order?.deliveryPhone && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {t('menu.deliveryPhone')}
                </span>
                <span className="font-medium">{order.deliveryPhone}</span>
              </div>
            )}
            {order?.ownerFullName && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <User className="w-4 h-4" />
                  {t('order.customer')}
                </span>
                <span className="font-medium">{order.ownerFullName}</span>
              </div>
            )}
            {order?.ownerPhoneNumber && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {t('order.phoneNumber')}
                </span>
                <span className="font-medium">{order.ownerPhoneNumber}</span>
              </div>
            )}
            {order?.description && (
              <div className="flex justify-between px-2 py-3 text-sm rounded-md border bg-muted-foreground/5">
                <span className="flex gap-2 items-center text-muted-foreground">
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
                  const original = (item.originalPrice ?? item.originalPrice ?? 0) * item.quantity

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
              <span>{`${formatCurrency(cartTotals.subTotalBeforeDiscount)}`}</span>
            </div>
            {cartTotals.promotionDiscount > 0 && (
              <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
                <span className="italic text-yellow-600">
                  {t('order.promotionDiscount')}:&nbsp;
                </span>
                <span className="italic text-yellow-600">
                  -{`${formatCurrency(cartTotals.promotionDiscount)}`}
                </span>
              </div>
            )}
            <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
              <span className="italic text-green-500">
                {t('order.voucher')}:&nbsp;
              </span>
              <span className="italic text-green-500">
                -{`${formatCurrency(cartTotals.voucherDiscount)}`}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center pt-2 mt-4 w-full font-semibold border-t text-md">
              <span>{t('order.totalPayment')}:&nbsp;</span>
              <span className="text-2xl font-extrabold text-primary">
                {`${formatCurrency(cartTotals.finalTotal)}`}
              </span>
            </div>
            <div className='flex flex-row gap-2 justify-end mt-4 w-full'>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 min-w-24"
                disabled={isPending || isPendingWithoutLogin}
              >
                {tCommon('common.cancel')}
              </Button>
              {(() => {
                const isDelivery = order?.type === OrderTypeEnum.DELIVERY
                const phoneOk = !!order?.deliveryPhone && PHONE_NUMBER_REGEX.test(order.deliveryPhone || '')
                const createDisabled = (isPending || isPendingWithoutLogin) || (isDelivery && (!order?.deliveryAddress || !phoneOk))
                return (
                  <Button onClick={() => {
                    if (order) {
                      handleSubmit(order)
                    }
                  }} disabled={createDisabled}>
                    {isPending || isPendingWithoutLogin && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('order.create')}
                  </Button>
                )
              })()}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
