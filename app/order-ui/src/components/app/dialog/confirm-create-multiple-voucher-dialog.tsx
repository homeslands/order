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
} from '@/components/ui'

import { ICreateMultipleVoucherRequest } from '@/types'
import { useCreateMultipleVoucher } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmCreateMultipleVoucherDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void // Add this new prop
  voucher: ICreateMultipleVoucherRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmCreateMultipleVoucherDialog({
  isOpen,
  onOpenChange,
  onCloseSheet, // Add this
  voucher,
  onSuccess
}: IConfirmCreateMultipleVoucherDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: createMultipleVoucher } = useCreateMultipleVoucher()

  const handleSubmit = (voucher: ICreateMultipleVoucherRequest) => {
    if (!voucher) return
    createMultipleVoucher(voucher, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers],
          exact: false,
          refetchType: 'all'
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.() // Thêm callback onSuccess
        showToast(tToast('toast.createVoucherSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('voucher.create')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmCreateMultipleVoucher')} {voucher?.numberOfVoucher} {t('voucher.vouchers')}
            <br />
            <br />
            <span className="text-sm italic text-destructive">
              {t('voucher.createMultipleVoucherNote')}
            </span>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => voucher && handleSubmit(voucher)}>
            {t('voucher.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
