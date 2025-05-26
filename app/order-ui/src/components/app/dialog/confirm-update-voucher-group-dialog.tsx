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

import { IUpdateVoucherGroupRequest } from '@/types'
import { useUpdateVoucherGroup } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdateVoucherGroupDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  voucherGroup: IUpdateVoucherGroupRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmUpdateVoucherGroupDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  voucherGroup,
  disabled,
  onSuccess
}: IConfirmUpdateVoucherGroupDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: updateVoucherGroup } = useUpdateVoucherGroup()

  const handleSubmit = (voucherGroup: IUpdateVoucherGroupRequest) => {
    if (!voucherGroup) return
    updateVoucherGroup(voucherGroup, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.voucherGroups]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.()
        showToast(tToast('toast.updateVoucherGroupSuccess'))
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
          {t('voucher.updateVoucherGroup')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('voucher.updateVoucherGroup')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmUpdateVoucher')}
            <br />
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
          <Button onClick={() => voucherGroup && handleSubmit(voucherGroup)}>
            {t('voucher.updateVoucherGroup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
