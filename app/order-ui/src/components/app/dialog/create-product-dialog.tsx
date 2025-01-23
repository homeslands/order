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

import { CreateProductForm } from '@/components/app/form'

export default function CreateProductDialog() {
  const { t } = useTranslation(['product'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="icon" />
          {t('product.create')}
        </Button>
      </DialogTrigger>
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
