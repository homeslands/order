import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { ICartItem, ICreateOrderRequest } from '@/types'
import { useCreateOrder } from '@/hooks'
import { showErrorToast, showToast } from '@/utils'
import { Role, ROUTE } from '@/constants'
import { useCartItemStore, useUserStore, useBranchStore } from '@/stores'

interface IPlaceOrderDialogProps {
  disabled?: boolean | undefined
  onSuccessfulOrder?: () => void
}

export default function PlaceOrderDialog({ disabled, onSuccessfulOrder }: IPlaceOrderDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { getCartItems, clearCart } = useCartItemStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const [isOpen, setIsOpen] = useState(false)
  const { getUserInfo, userInfo } = useUserStore()
  const { branch } = useBranchStore()

  const order = getCartItems()

  const handleSubmit = (order: ICartItem) => {
    if (!order) return

    const selectedBranch =
      userInfo?.role.name === Role.CUSTOMER
        ? branch?.slug
        : userInfo?.branch?.slug

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
        ... (orderItem.promotion && { promotion: orderItem.promotion }),
        note: orderItem.note || '',
      })),
      voucher: order.voucher?.slug || null,
      description: order.description || '',
    }

    // Call API to create order
    createOrder(createOrderRequest, {
      onSuccess: (data) => {
        const orderPath =
          userInfo?.role.name === Role.CUSTOMER
            ? `${ROUTE.CLIENT_PAYMENT}?order=${data.result.slug}`
            : `${ROUTE.STAFF_ORDER_PAYMENT}?order=${data.result.slug}`
        navigate(orderPath)
        setIsOpen(false)
        onSuccessfulOrder?.()
        clearCart()
        showToast(tToast('toast.createOrderSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {t('order.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('order.create')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('order.confirmOrder')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-gray-300 min-w-24"
            disabled={isPending}
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => order && handleSubmit(order)} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('order.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
