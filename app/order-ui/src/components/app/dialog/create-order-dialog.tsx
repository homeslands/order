import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, MapPin, Phone, Receipt, ShoppingCart, User } from 'lucide-react'

import {
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
import { formatCurrency, showErrorToast, showToast } from '@/utils'
import { Role, ROUTE, VOUCHER_TYPE } from '@/constants'
import { useCartItemStore, useUserStore, useBranchStore } from '@/stores'
import _ from 'lodash'

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
      orderItems: order.orderItems.map((orderItem) => ({
        quantity: orderItem.quantity,
        variant: orderItem.variant,
        ...(orderItem.promotion && { promotion: orderItem.promotion }),
        note: orderItem.note || '',
      })),
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
  const cartItems = getCartItems()

  const subTotal = _.sumBy(
    cartItems?.orderItems,
    (item) => item.price * item.quantity,
  )
  const discount = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER ? (subTotal * (cartItems?.voucher?.value || 0)) / 100 : cartItems?.voucher?.value || 0
  const totalAfterDiscount = subTotal - discount

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

      <DialogContent className="max-w-[22rem] rounded-md p-0 gap-0 sm:max-w-[48rem] h-[calc(100vh-10rem)] sm:h-[calc(100vh-10rem)]">
        <DialogHeader className="p-4 h-fit">
          <DialogTitle className="pb-2 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('order.create')}
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('order.confirmOrder')}
          </DialogDescription>
        </DialogHeader>

        {/* Order Items List */}
        <ScrollArea className="h-[calc(100vh-30rem)] sm:h-[calc(100vh-28rem)] px-4 flex flex-col gap-4">
          {/* Order Info */}
          <div className="p-2 space-y-2 text-sm rounded-md border border-primary/60 bg-primary/5">
            <div className="flex justify-between">
              <span className="flex gap-2 items-center text-gray-600">
                <Receipt className="w-4 h-4" />
                {t('order.orderType')}
              </span>
              <span className="font-medium">
                {order?.type === 'at-table' ? t('menu.dineIn') : t('menu.takeAway')}
              </span>
            </div>
            {order?.tableName && (
              <div className="flex justify-between">
                <span className="flex gap-2 items-center text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {t('menu.tableName')}
                </span>
                <span className="font-medium">{order.tableName}</span>
              </div>
            )}
            {order?.ownerFullName && (
              <div className="flex justify-between">
                <span className="flex gap-2 items-center text-gray-600">
                  <User className="w-4 h-4" />
                  {t('order.customer')}
                </span>
                <span className="font-medium">{order.ownerFullName}</span>
              </div>
            )}
            {order?.ownerPhoneNumber && (
              <div className="flex justify-between">
                <span className="flex gap-2 items-center text-gray-600">
                  <Phone className="w-4 h-4" />
                  {t('order.phoneNumber')}
                </span>
                <span className="font-medium">{order.ownerPhoneNumber}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 px-2 py-4 mt-6 border-t border-dashed border-muted-foreground/60">
            {order?.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.name} - <span className="text-sm text-muted-foreground">Size {item.size.toUpperCase()}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                  {/* <p className="text-sm font-semibold text-primary">{formatCurrency(item.quantity * item.price)}</p> */}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 h-fit">
          {/* Total Amount */}
          <div className="flex flex-col gap-1 justify-start items-start w-full">
            <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
              {t('order.subtotal')}:&nbsp;
              <span>{`${formatCurrency(subTotal)}`}</span>
            </div>
            <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
              <span className="italic text-green-500">
                {t('order.voucher')}:&nbsp;
              </span>
              <span className="italic text-green-500">
                -{`${formatCurrency(discount)}`}
              </span>
            </div>
            <div className="flex gap-2 justify-between items-center pt-2 mt-4 w-full font-semibold border-t text-md">
              <span>{t('order.totalPayment')}:&nbsp;</span>
              <span className="text-2xl font-extrabold text-primary">
                {`${formatCurrency(totalAfterDiscount)}`}
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
          {/* <div className='flex flex-col gap-4 w-full'>
            <div className="flex justify-between items-center font-semibold">
              <span>{t('menu.subTotal')}</span>
              <span className='text-2xl font-extrabold text-primary'>
                {formatCurrency(subTotal || 0)}
              </span>
            </div>
            {discount > 0 && (
              <div className='flex flex-row gap-2 justify-between'>
                <span className='text-sm text-green-600'>
                  {t('menu.discount')}
                </span>
                <span className='text-sm italic text-green-600'>
                  - {formatCurrency(discount)}
                </span>
              </div>
            )}
            {totalAfterDiscount > 0 && (
              <div className='flex flex-row gap-2 justify-between'>
                <span className='text-sm text-primary'>
                  {t('menu.total')}
                </span>
                <span className='text-sm text-primary'>
                  {formatCurrency(totalAfterDiscount)}
                </span>
              </div>
            )}
            <div className='flex flex-row gap-2 justify-end'>
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
