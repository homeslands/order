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

import { ICreateVoucherForUserGroupRequest } from '@/types'
import { useCreateVoucherForUserGroup } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmApplyVoucherForUserGroupDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  applyVoucherForUserGroupRequest: ICreateVoucherForUserGroupRequest | null
  voucherSlug: string
  disabled?: boolean
}

export default function ConfirmApplyVoucherForUserGroupDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  applyVoucherForUserGroupRequest,
  voucherSlug,
  disabled,
}: IConfirmApplyVoucherForUserGroupDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: createVoucherForUserGroup, isPending } = useCreateVoucherForUserGroup()

  const handleSubmit = (voucherForUserGroup: ICreateVoucherForUserGroupRequest) => {
    if (!voucherForUserGroup || !voucherSlug) return
    voucherForUserGroup.vouchers = [voucherSlug]
    createVoucherForUserGroup(voucherForUserGroup, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        showToast(tToast('toast.applyVoucherForUserGroupSuccess'))
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
          {t('voucher.apply')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.applyVoucher')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmApplyVoucher')}
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
            disabled={isPending}
            onClick={() => applyVoucherForUserGroupRequest && handleSubmit(applyVoucherForUserGroupRequest)}
          >
            {isPending ? <div className="flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('voucher.apply')}
            </div> : t('voucher.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
