import { useQueryClient } from '@tanstack/react-query'
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

import { IUpdateVoucherRequest } from '@/types'
import { useUpdateVoucher } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdateVoucherDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  voucher: IUpdateVoucherRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmUpdateVoucherDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  voucher,
  disabled,
  onSuccess
}: IConfirmUpdateVoucherDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: updateVoucher } = useUpdateVoucher()

  const handleSubmit = (voucher: IUpdateVoucherRequest) => {
    if (!voucher) return
    updateVoucher(voucher, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.()
        showToast(tToast('toast.updateVoucherSuccess'))
      },
    })
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
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('voucher.update')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmUpdateVoucher')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => voucher && handleSubmit(voucher)}>
            {t('voucher.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
