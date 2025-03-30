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

import { CreateChefAreaForm } from '@/components/app/form'

export default function CreateChefAreaDialog() {
  const { t } = useTranslation(['chefArea'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="icon" />
          {t('chefArea.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('chefArea.create')}</DialogTitle>
          <DialogDescription>
            {t('chefArea.createChefAreaDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateChefAreaForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
