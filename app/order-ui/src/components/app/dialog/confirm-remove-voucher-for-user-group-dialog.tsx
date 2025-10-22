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

import { IDeleteVoucherForUserGroupRequest, IVoucher } from '@/types'
import { useDeleteVoucherForUserGroup } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmRemoveVoucherForUserGroupDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  deleteVoucherForUserGroupRequest: IDeleteVoucherForUserGroupRequest
  voucher: IVoucher
  disabled?: boolean
}

export default function ConfirmRemoveVoucherForUserGroupDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  deleteVoucherForUserGroupRequest,
  voucher,
  disabled,
}: IConfirmRemoveVoucherForUserGroupDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteVoucherForUserGroup, isPending } = useDeleteVoucherForUserGroup()

  const handleSubmit = (data: IDeleteVoucherForUserGroupRequest) => {
    if (!deleteVoucherForUserGroup || !voucher.slug) return
    deleteVoucherForUserGroup(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers]
        })
        onOpenChange(false)
        onCloseSheet()
        showToast(tToast('toast.removeAppliedVoucherForUserGroupSuccess'))
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
          {t('voucher.removeVoucherForUserGroup')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.removeAppliedVoucherForUserGroup')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.removeVoucherForUserGroupWarning1')} <strong>{voucher?.title}</strong> {t('voucher.removeVoucherForUserGroupWarning2')}
            <br />
            {t('voucher.confirmRemoveVoucherForUserGroup')}
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
            onClick={() => deleteVoucherForUserGroupRequest && handleSubmit(deleteVoucherForUserGroupRequest)}
          >
            {isPending ? <div className="flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('voucher.removeVoucherForUserGroup')}
            </div> : t('voucher.removeVoucherForUserGroup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
