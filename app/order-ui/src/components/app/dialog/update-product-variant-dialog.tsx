import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

interface IUpdateProductVariantDialogProps {
  productVariant: IProductVariant
}

import { UpdateProductVariantForm } from '@/components/app/form'
import { IProductVariant } from '@/types'

export default function UpdateProductVariantDialog({
  productVariant,
}: IUpdateProductVariantDialogProps) {
  const { t } = useTranslation(['product'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start items-center">
        <Button
          variant="ghost"
          className="gap-1 px-2 h-10 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PlusCircledIcon className="icon" />
          {t('productVariant.update')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('productVariant.update')}</DialogTitle>
          <DialogDescription>
            {t('productVariant.updateProductVariantDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateProductVariantForm
          productVariant={productVariant}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
