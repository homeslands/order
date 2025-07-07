import { useState } from 'react'
import { useParams } from 'react-router-dom'
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

import { IPrinterForChefArea } from '@/types'

import { useDeletePrinterForChefArea } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

export default function DeletePrinterDialog({ printer }: { printer: IPrinterForChefArea }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { slug } = useParams()
  const { mutate: deletePrinter } = useDeletePrinterForChefArea()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (printerSlug: string) => {
    if (!slug) return // hoặc showToast lỗi nếu cần

    deletePrinter({ printerSlug, slug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefAreaPrinters, slug],
          exact: false,
          refetchType: 'all',
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteChefAreaPrinterSuccess'))
      },
    })
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm text-destructive bg-destructive/10"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('printer.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('printer.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('printer.deletePrinterWarning')}{' '}
            <span className="font-bold">{printer?.name}</span> <br />
            <br />
            {t('printer.deletePrinterConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => printer && handleSubmit(printer?.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
