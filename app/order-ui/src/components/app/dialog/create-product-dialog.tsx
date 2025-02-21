import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { CreateProductForm } from '@/components/app/form'

interface CreateProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProductDialog({ isOpen, onOpenChange }: CreateProductDialogProps) {
  const { t } = useTranslation(['product'])
  const handleSubmit = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-md px-6 sm:max-w-[36%]">
        <DialogHeader>
          <DialogTitle>{t('product.create')}</DialogTitle>
          <DialogDescription>
            {t('product.createProductDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateProductForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
