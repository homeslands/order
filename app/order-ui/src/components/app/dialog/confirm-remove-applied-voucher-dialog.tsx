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

import { IRemoveAppliedVoucherRequest } from '@/types'
import { useRemoveAppliedVoucher } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmRemoveAppliedVoucherDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  removeAppliedVoucherData: IRemoveAppliedVoucherRequest | null
  disabled?: boolean
}

export default function ConfirmRemoveAppliedVoucherDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  removeAppliedVoucherData,
  disabled,
}: IConfirmRemoveAppliedVoucherDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: removeAppliedVoucher, isPending } = useRemoveAppliedVoucher()

  const handleSubmit = (appliedPromotionSlug: string) => {
    if (!appliedPromotionSlug) return
    const data: IRemoveAppliedVoucherRequest = {
      vouchers: removeAppliedVoucherData?.vouchers || [],
      products: removeAppliedVoucherData?.products || [],
    }
    removeAppliedVoucher(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        showToast(tToast('toast.removeAppliedVoucherSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full lg:w-fit"
          onClick={() => onOpenChange(true)}
        >
          {t('voucher.removeAppliedVoucher')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.removeAppliedVoucher')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-destructive/10 text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmRemoveAppliedVoucher')}
            <br />
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
            variant="destructive"
            disabled={isPending}
            onClick={() => removeAppliedVoucherData && handleSubmit(removeAppliedVoucherData.vouchers[0])}
          >
            {isPending ? <div className="flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('voucher.remove')}
            </div> : t('voucher.remove')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
