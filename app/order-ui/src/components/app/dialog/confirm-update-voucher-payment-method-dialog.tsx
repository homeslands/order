import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IVoucherPaymentMethodDiff } from '@/types'
import { useUpdateVoucherPaymentMethod, useDeleteVoucherPaymentMethod } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdateVoucherPaymentMethodDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  paymentMethodDiff: IVoucherPaymentMethodDiff
  disabled?: boolean
}

export default function ConfirmUpdateVoucherPaymentMethodDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  paymentMethodDiff,
  disabled,
}: IConfirmUpdateVoucherPaymentMethodDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutateAsync: updateVoucherPaymentMethod, isPending: isUpdating } = useUpdateVoucherPaymentMethod()
  const { mutateAsync: deleteVoucherPaymentMethod, isPending: isDeleting } = useDeleteVoucherPaymentMethod()

  const isPending = isUpdating || isDeleting

  const handleSubmit = async (diff: IVoucherPaymentMethodDiff) => {
    if (!diff || (diff.toAdd.length === 0 && diff.toRemove.length === 0)) return

    try {
      const promises: Promise<unknown>[] = []

      // Add new payment methods
      if (diff.toAdd.length > 0) {
        diff.toAdd.forEach(paymentMethod => {
          promises.push(
            updateVoucherPaymentMethod({
              voucher: diff.voucher,
              paymentMethod: paymentMethod,
            })
          )
        })
      }

      // Remove payment methods
      if (diff.toRemove.length > 0) {
        diff.toRemove.forEach(paymentMethod => {
          promises.push(
            deleteVoucherPaymentMethod({
              voucher: diff.voucher,
              paymentMethod: paymentMethod,
            })
          )
        })
      }

      // Wait for all operations to complete
      await Promise.all(promises)

      // Success - refetch data, close dialog, show toast
      queryClient.invalidateQueries({
        queryKey: [QUERYKEY.vouchers]
      })
      onOpenChange(false)
      onCloseSheet()
      showToast(tToast('toast.updateVoucherSuccess'))

    } catch {
      // Error handling
      showToast(tToast('toast.voucherPaymentMethodInvalid'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full sm:w-[10rem]"
          onClick={() => onOpenChange(true)}
        >
          {t('voucher.update')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.updateVoucherPaymentMethod')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmUpdateVoucherPaymentMethod')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            disabled={isPending}
            onClick={() => handleSubmit(paymentMethodDiff)}
          >
            {isPending ? <div className="flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('voucher.update')}
            </div> : t('voucher.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
