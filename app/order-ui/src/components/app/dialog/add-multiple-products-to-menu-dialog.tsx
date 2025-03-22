import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  ScrollArea,
} from '@/components/ui'
import { IAddMenuItemRequest } from '@/types'
import { AddMenuMultipleItemsForm } from '@/components/app/form'

interface AddMenuItemsDialogProps {
  products: IAddMenuItemRequest[]
  onSubmit: (isOpen: boolean) => void
}

export default function AddMenuItemsDialog({
  products,
  onSubmit,
}: AddMenuItemsDialogProps) {
  const { t } = useTranslation(['menu'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
    onSubmit(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-10 gap-1 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PlusCircledIcon className="icon" />
          {t('menu.addMenuItem')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[44rem]">
        <DialogHeader>
          <DialogTitle>{t('menu.addMenuItem')}</DialogTitle>
          <DialogDescription>
            {t('menu.addMenuItemDescription')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[24rem]">
          <AddMenuMultipleItemsForm
            onSubmit={handleSubmit}
            products={products}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
