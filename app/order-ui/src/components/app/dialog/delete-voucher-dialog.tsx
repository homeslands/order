import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IVoucher } from '@/types'

import { useDeleteVoucher } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

export default function DeleteVoucherDialog({ voucher }: { voucher: IVoucher }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteVoucher } = useDeleteVoucher()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (voucherSlug: string) => {
    deleteVoucher(voucherSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.vouchers],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteVoucherSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex gap-1 justify-start px-2 w-full text-sm transition-all duration-300 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('voucher.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('voucher.deleteVoucherWarning1')}{' '}
            <span className="font-bold">{voucher?.title}</span> <br />
            <br />
            {t('voucher.deleteVoucherConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => voucher && handleSubmit(voucher.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
