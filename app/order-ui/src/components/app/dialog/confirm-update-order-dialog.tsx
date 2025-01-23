import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

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
import { showErrorToast } from '@/utils'
import { Role } from '@/constants'
import { useUpdateOrderStore, useUserStore, useBranchStore } from '@/stores'

interface IUpdateOrderDialogProps {
  disabled?: boolean
}

export default function ConfirmUpdateOrderDialog({ disabled }: IUpdateOrderDialogProps) {
  // const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  // const { t: tToast } = useTranslation('toast')
  const { orderItems } = useUpdateOrderStore()
  // const { mutate: createOrder } = useCreateOrder()
  const [isOpen, setIsOpen] = useState(false)
  const { getUserInfo, userInfo } = useUserStore()
  const { branch } = useBranchStore()

  // const order = getCartItems()

  const handleSubmit = (order: ICartItem) => {
    if (!order) return

    const selectedBranch =
      userInfo?.role.name === Role.CUSTOMER
        ? branch?.slug
        : userInfo?.branch.slug

    if (!selectedBranch) {
      showErrorToast(11000)
      return
    }

    const createOrderRequest: ICreateOrderRequest = {
      type: order.type,
      table: order.table || '',
      branch: selectedBranch,
      owner: order.owner || '',
      approvalBy: getUserInfo()?.slug || '',
      orderItems: order.orderItems.map((orderItem) => ({
        quantity: orderItem.quantity,
        variant: orderItem.variant,
        note: orderItem.note || '',
      })),
    }

    console.log(createOrderRequest)

    // Gọi API để tạo đơn hàng.
    // createOrder(createOrderRequest, {
    //   onSuccess: (data) => {
    //     const orderPath =
    //       userInfo?.role.name === Role.CUSTOMER
    //         ? `${ROUTE.CLIENT_ORDER_PAYMENT}/${data.result.slug}`
    //         : `${ROUTE.STAFF_ORDER_PAYMENT}/${data.result.slug}`
    //     navigate(orderPath)
    //     setIsOpen(false)
    //     clearCart()
    //     showToast(tToast('toast.createOrderSuccess'))
    //   },
    // })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {t('order.confirm')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('order.update')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('order.confirmUpdateOrder')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => orderItems && handleSubmit(orderItems)}>
            {t('order.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
