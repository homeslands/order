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

import { IUpdatePrinterForChefAreaRequest } from '@/types'
import { useUpdatePrinterForChefArea } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useParams } from 'react-router-dom'

interface IConfirmUpdatePrinterDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  printer: IUpdatePrinterForChefAreaRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmUpdatePrinterDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  printer,
  disabled,
  onSuccess
}: IConfirmUpdatePrinterDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { slug } = useParams()
  const { mutate: updatePrinter } = useUpdatePrinterForChefArea()

  const handleSubmit = (printer: IUpdatePrinterForChefAreaRequest) => {
    if (!printer) return
    updatePrinter(printer, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefAreaPrinters, slug],
          exact: false,
          refetchType: 'all',
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.()
        showToast(tToast('toast.updateChefAreaPrinterSuccess'))
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
          {t('printer.update')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('printer.update')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('printer.confirmUpdatePrinter')}
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
          <Button onClick={() => printer && handleSubmit(printer)}>
            {t('printer.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
