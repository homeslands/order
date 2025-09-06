import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  DialogFooter,
} from '@/components/ui'
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

  const handleCancel = () => {
    // Revert về payment method trước đó nếu có
    if (previousPaymentMethod) {
      updatePaymentMethod(previousPaymentMethod)
    }
    onCancel?.()
    onOpenChange(false)
  }

  const handleRemoveVoucher = () => {
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

            // Close dialog immediately to prevent flicker
            onOpenChange(false)

            // Update payment method after dialog is closed
            setTimeout(() => {
              // Sau khi xóa voucher, giữ nguyên method mà user đã chọn
              // Không cần check với payment resolver nữa vì không còn voucher
              updatePaymentMethod(PaymentMethod.BANK_TRANSFER)

              // Call parent onSuccess after payment method is updated
              onSuccess?.(response.result)
            }, 50)
          },
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

            // Close dialog immediately to prevent flicker
            onOpenChange(false)

            // Update payment method after dialog is closed
            setTimeout(() => {
              // Always use selectedPaymentMethod since it's what user wants to switch to
              updatePaymentMethod(PaymentMethod.BANK_TRANSFER)

              // Call parent onSuccess after payment method is updated
              onSuccess?.(response.result)
            }, 50)
          },
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
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleRemoveVoucher}
          >
            {t('order.removeVoucher')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
