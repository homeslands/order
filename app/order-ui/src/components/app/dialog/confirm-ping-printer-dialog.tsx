import { useParams } from 'react-router-dom'
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

import { IPrinterForChefArea } from '@/types'
import { usePingPrinterForChefArea } from '@/hooks'
import { showToast } from '@/utils'
import { useState } from 'react'

interface IConfirmPingPrinterDialogProps {
  printer: IPrinterForChefArea
}

export default function ConfirmPingPrinterDialog({
  printer,
}: IConfirmPingPrinterDialogProps) {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { slug } = useParams()
  const [isOpen, onOpenChange] = useState(false)
  const { mutate: pingPrinter, isPending } = usePingPrinterForChefArea()

  const handleSubmit = (printer: IPrinterForChefArea) => {
    if (!printer?.slug || !slug) return
    pingPrinter({ slug, printerSlug: printer.slug }, {
      onSuccess: () => {
        onOpenChange(false)
        showToast(tToast('toast.pingPrinterSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center w-full text-sm"
          onClick={() => onOpenChange(true)}
          disabled={!printer.ip || !printer.port || !printer.isActive}
        >
          {t('printer.pingPrinter')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('printer.pingPrinter')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('printer.pingPrinterDescription')} {printer.name}
            {t('printer.pingPrinterDescription2')}
            <br />
            <span className="text-primary">
              {t('printer.pingPrinterDescription3')}
            </span>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
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
            onClick={() => printer && handleSubmit(printer)}
          >
            {isPending ? <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('printer.pingPrinter')}
            </div> : t('printer.pingPrinter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
