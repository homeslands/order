import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui'

import { useExportProductImportTemplate } from '@/hooks'
import { showToast } from '@/utils'

export default function DownloadImportProductsTemplateDialog() {
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: exportProductImportTemplate } = useExportProductImportTemplate()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = () => {
    exportProductImportTemplate(undefined, {
      onSuccess: () => {
        setIsOpen(false)
        showToast(tToast('toast.exportProductImportTemplateSuccess'))
      },
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="flex justify-start w-full gap-1 px-2 text-xs"
        >
          <FileDown className="icon" />
          {t('product.exportProductImportTemplate')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle>
            {t('product.exportProductImportTemplate')}
          </DialogTitle>
          <DialogDescription>
            {t('product.exportProductImportTemplateDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-sm text-muted-foreground">
          {t('product.exportProductImportTemplateConfirmation')}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {t('product.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
