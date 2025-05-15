import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SquarePen } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { UpdateMenuForm } from '@/components/app/form'
import { IMenu } from '@/types'

interface IUpdateMenuDialogProps {
  menu: IMenu
}

export default function UpdateMenuDialog({ menu }: IUpdateMenuDialogProps) {
  const { t } = useTranslation(['menu'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start">
        <Button
          variant="ghost"
          className="gap-1 px-2 h-10 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <SquarePen className="icon" />
          {t('menu.update')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('menu.update')}</DialogTitle>
          <DialogDescription>
            {t('menu.updateMenuDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateMenuForm menu={menu} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
