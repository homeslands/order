import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui'

import { useExportAllProductsFile } from '@/hooks'
import { showToast } from '@/utils'

interface ExportAllProductsTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportAllProductsTemplateDialog({ isOpen, onOpenChange }: ExportAllProductsTemplateDialogProps) {
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: exportAllProductsFile } = useExportAllProductsFile()
  // const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = () => {
    exportAllProductsFile(undefined, {
      onSuccess: () => {
        onOpenChange(false)
        showToast(tToast('toast.exportAllProductsTemplateSuccess'))
      },
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
      }}
    >
      {/* <DialogTrigger asChild>
        <Button
          className="flex justify-start w-full gap-1 px-2 text-xs"
        >
          <FileDown className="icon" />
          {t('product.exportAllProducts')}
        </Button>
      </DialogTrigger> */}

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle>
            {t('product.exportAllProducts')}
          </DialogTitle>
          <DialogDescription>
            {t('product.exportAllProductsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-sm text-muted-foreground">
          {t('product.exportAllProductsConfirmation')}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
