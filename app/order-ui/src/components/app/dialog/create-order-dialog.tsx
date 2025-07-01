import _ from 'lodash'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, MapPin, Notebook, Phone, Receipt, ShoppingCart, User } from 'lucide-react'

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

import { ICartItem, ICreateOrderRequest, OrderTypeEnum } from '@/types'
import { useCreateOrder, useCreateOrderWithoutLogin } from '@/hooks'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, showErrorToast, showToast } from '@/utils'
import { Role, ROUTE } from '@/constants'
import { useCartItemStore, useUserStore, useBranchStore } from '@/stores'

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
  const { getCartItems, clearCart } = useCartItemStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const { mutate: createOrderWithoutLogin, isPending: isPendingWithoutLogin } = useCreateOrderWithoutLogin()
  const [isOpen, setIsOpen] = useState(false)
  const { getUserInfo, userInfo } = useUserStore()
  const { branch } = useBranchStore()

  const order = getCartItems()

  const displayItems = calculateCartItemDisplay(
    order,
    order?.voucher || null
  )

  const cartTotals = calculateCartTotals(displayItems, order?.voucher || null)

  const handleSubmit = (order: ICartItem) => {
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

    const createOrderRequest: ICreateOrderRequest = {
      type: order.type,
      table: order.table || '',
      branch: selectedBranch,
      owner: order.owner || getUserInfo()?.slug || '',
      approvalBy: getUserInfo()?.slug || '',
      orderItems: order.orderItems.map((orderItem) => {
        return {
          quantity: orderItem.quantity,
          variant: orderItem.variant.slug,
          promotion: orderItem.promotion || null, // luôn có field promotion
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
          navigate(orderPath)
          setIsOpen(false)
          onSuccessfulOrder?.()
          if (userInfo?.role.name === Role.CUSTOMER) {
            clearCart()
          }
          showToast(tToast('toast.createOrderSuccess'))
        },
      })
    } else {
      createOrderWithoutLogin(createOrderRequest, {
        onSuccess: (data) => {
          onSuccess?.()
          navigate(`${ROUTE.CLIENT_PAYMENT}?order=${data.result.slug}`)
          setIsOpen(false)
          onSuccessfulOrder?.()
          clearCart()
          showToast(tToast('toast.createOrderSuccess'))
        },
      })
    }
  }
  // const cartItems = getCartItems()

  // const subTotal = _.sumBy(
  //   cartItems?.orderItems,
  //   (item) => item.price * item.quantity,
  // )
  // const discount = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER ? (subTotal * (cartItems?.voucher?.value || 0)) / 100 : cartItems?.voucher?.value || 0
  // const totalAfterDiscount = subTotal - discount

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || isPending || isPendingWithoutLogin}
          className="flex items-center w-full text-sm rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {isPending || isPendingWithoutLogin && <Loader2 className="w-4 h-4 animate-spin" />}
          {(order?.type === OrderTypeEnum.TAKE_OUT ||
            (order?.type === OrderTypeEnum.AT_TABLE && order.table))
            ? t('order.create')
            : t('menu.noSelectedTable')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md p-0 gap-0 sm:max-w-[48rem] h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
        <DialogHeader className="p-4 h-fit">
          <DialogTitle className="pb-2 border-b">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 p-1 rounded-lg bg-primary/20 text-primary">
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
            <div className="flex items-center justify-between px-2 py-3 text-sm border rounded-md bg-muted-foreground/5">
              <span className="flex items-center gap-2 text-gray-600">
                <Receipt className="w-4 h-4" />
                {t('order.orderType')}
              </span>
              <Badge className={`shadow-none ${order?.type === OrderTypeEnum.AT_TABLE ? '' : 'bg-blue-500/20 text-blue-500'}`}>
                {order?.type === OrderTypeEnum.AT_TABLE ? t('menu.dineIn') : t('menu.takeAway')}
              </Badge>
            </div>
            {order?.tableName && (
              <div className="flex justify-between px-2 py-3 text-sm border rounded-md bg-muted-foreground/5">
                <span className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {t('menu.tableName')}
                </span>
                <span className="font-medium">{order.tableName}</span>
              </div>
            )}
            {order?.ownerFullName && (
              <div className="flex justify-between px-2 py-3 text-sm border rounded-md bg-muted-foreground/5">
                <span className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  {t('order.customer')}
                </span>
                <span className="font-medium">{order.ownerFullName}</span>
              </div>
            )}
            {order?.ownerPhoneNumber && (
              <div className="flex justify-between px-2 py-3 text-sm border rounded-md bg-muted-foreground/5">
                <span className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {t('order.phoneNumber')}
                </span>
                <span className="font-medium">{order.ownerPhoneNumber}</span>
              </div>
            )}
            {order?.description && (
              <div className="flex justify-between px-2 py-3 text-sm border rounded-md bg-muted-foreground/5">
                <span className="flex items-center gap-2 text-gray-600">
                  <Notebook className="w-4 h-4" />
                  {t('order.note')}
                </span>
                <span className="font-medium">{order.description}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 px-2 py-4 mt-6 border-t border-dashed border-muted-foreground/60">
            {order?.orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
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
                  const original = (item.originalPrice ?? item.price ?? 0) * item.quantity

                  const hasDiscount = original > finalPrice

                  return (
                    <div className="relative flex items-center gap-1">
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
          <div className="flex flex-col items-start justify-start w-full gap-1">
            <div className="flex items-center justify-between w-full gap-2 text-sm text-muted-foreground">
              {t('order.subtotal')}:&nbsp;
              <span>{`${formatCurrency(cartTotals.subTotalBeforeDiscount)}`}</span>
            </div>
            {cartTotals.promotionDiscount > 0 && (
              <div className="flex items-center justify-between w-full gap-2 text-sm text-muted-foreground">
                <span className="italic text-yellow-600">
                  {t('order.promotionDiscount')}:&nbsp;
                </span>
                <span className="italic text-yellow-600">
                  -{`${formatCurrency(cartTotals.promotionDiscount)}`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between w-full gap-2 text-sm text-muted-foreground">
              <span className="italic text-green-500">
                {t('order.voucher')}:&nbsp;
              </span>
              <span className="italic text-green-500">
                -{`${formatCurrency(cartTotals.voucherDiscount)}`}
              </span>
            </div>
            <div className="flex items-center justify-between w-full gap-2 pt-2 mt-4 font-semibold border-t text-md">
              <span>{t('order.totalPayment')}:&nbsp;</span>
              <span className="text-2xl font-extrabold text-primary">
                {`${formatCurrency(cartTotals.finalTotal)}`}
              </span>
            </div>
            <div className='flex flex-row justify-end w-full gap-2 mt-4'>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 min-w-24"
                disabled={isPending || isPendingWithoutLogin}
              >
                {tCommon('common.cancel')}
              </Button>
              <Button onClick={() => {
                if (order) {
                  handleSubmit(order)
                }
              }} disabled={isPending || isPendingWithoutLogin}>
                {isPending || isPendingWithoutLogin && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('order.create')}
              </Button>
            </div>
            {/* <span className='text-xs text-muted-foreground'>
                    ({t('order.vat')})
                  </span> */}
          </div>
          {/* <div className='flex flex-col w-full gap-4'>
            <div className="flex items-center justify-between font-semibold">
              <span>{t('menu.subTotal')}</span>
              <span className='text-2xl font-extrabold text-primary'>
                {formatCurrency(subTotal || 0)}
              </span>
            </div>
            {discount > 0 && (
              <div className='flex flex-row justify-between gap-2'>
                <span className='text-sm text-green-600'>
                  {t('menu.discount')}
                </span>
                <span className='text-sm italic text-green-600'>
                  - {formatCurrency(discount)}
                </span>
              </div>
            )}
            {totalAfterDiscount > 0 && (
              <div className='flex flex-row justify-between gap-2'>
                <span className='text-sm text-primary'>
                  {t('menu.total')}
                </span>
                <span className='text-sm text-primary'>
                  {formatCurrency(totalAfterDiscount)}
                </span>
              </div>
            )}
            <div className='flex flex-row justify-end gap-2'>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 min-w-24"
                disabled={isPending || isPendingWithoutLogin}
              >
                {tCommon('common.cancel')}
              </Button>
              <Button onClick={() => {
                if (order) {
                  handleSubmit(order)
                }
              }} disabled={isPending || isPendingWithoutLogin}>
                {isPending || isPendingWithoutLogin && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('order.create')}
              </Button>
            </div>
          </div> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
