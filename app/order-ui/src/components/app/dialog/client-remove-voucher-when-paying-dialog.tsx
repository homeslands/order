import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  DialogFooter,
} from '@/components/ui'
import { ButtonLoading } from '@/components/app/loading'
import { showToast } from '@/utils'
import { useUpdatePublicVoucherInOrder, useUpdateVoucherInOrder } from '@/hooks'
import { IOrder, IVoucher } from '@/types'
import { useOrderFlowStore, useUserStore } from '@/stores'
import { PaymentMethod } from '@/constants'

export default function ClientRemoveVoucherWhenPayingDialog({
  voucher: _voucher,
  isOpen,
  onOpenChange,
  order,
  selectedPaymentMethod: _selectedPaymentMethod,
  previousPaymentMethod,
  onSuccess,
  onCancel,
  onRemoveStart,
}: {
  voucher?: IVoucher | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  order?: IOrder
  selectedPaymentMethod: PaymentMethod | string
  previousPaymentMethod?: PaymentMethod
  onSuccess?: (updatedOrder: IOrder) => void
  onCancel?: () => void
  onRemoveStart?: () => void
}) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { mutate: updateVoucherInOrder } = useUpdateVoucherInOrder()
  const { mutate: updatePublicVoucherInOrder } = useUpdatePublicVoucherInOrder()
  const { updatePaymentMethod } = useOrderFlowStore()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleCancel = () => {
    // Don't allow cancel when removing
    if (isRemoving) return

    // Revert về payment method trước đó nếu có
    if (previousPaymentMethod) {
      updatePaymentMethod(previousPaymentMethod)
    }
    onCancel?.()
    onOpenChange(false)
  }

  const handleRemoveVoucher = () => {
    // Prevent multiple clicks
    if (isRemoving) return

    setIsRemoving(true)
    // Notify parent that removal process is starting
    onRemoveStart?.()

    if (userInfo) {
      updateVoucherInOrder(
        {
          slug: order?.slug || '',
          voucher: null,
          orderItems:
            order?.orderItems?.map((item) => ({
              quantity: item.quantity || 0,
              variant: item.variant.slug || '',
              note: item.note || '',
              promotion: item.promotion ? item.promotion.slug : null,
            })) || [],
        },
        {
          onSuccess: (response) => {
            showToast(tToast('toast.removeVoucherSuccess'))

            // Close dialog immediately
            onOpenChange(false)

            // Call parent onSuccess immediately - parent will handle payment method update
            onSuccess?.(response.result)
            setIsRemoving(false)
          },
          onError: () => {
            setIsRemoving(false)
          }
        }
      )
    } else {
      updatePublicVoucherInOrder(
        {
          slug: order?.slug || '',
          voucher: null,
          orderItems:
            order?.orderItems?.map((item) => ({
              quantity: item.quantity || 0,
              variant: item.variant.slug || '',
              note: item.note || '',
              promotion: item.promotion ? item.promotion.slug : null,
            })) || [],
        },
        {
          onSuccess: (response) => {
            showToast(tToast('toast.removeVoucherSuccess'))

            // Close dialog immediately
            onOpenChange(false)

            // Call parent onSuccess immediately - parent will handle payment method update
            onSuccess?.(response.result)
            setIsRemoving(false)
          },
          onError: () => {
            setIsRemoving(false)
          }
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[18rem] overflow-hidden rounded-lg sm:max-h-[32rem] sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>{t('order.voucherNotApplicable')}</DialogTitle>
          <DialogDescription>
            {t('order.voucherNotApplicableDescription')}
          </DialogDescription>
        </DialogHeader>
        <span className="text-sm italic text-destructive">
          {t('order.cashContactSupport')}
        </span>
        <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-end">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCancel}
            disabled={isRemoving}
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleRemoveVoucher}
            disabled={isRemoving}
          >
            {isRemoving && <ButtonLoading />}
            {t('order.removeVoucher')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
