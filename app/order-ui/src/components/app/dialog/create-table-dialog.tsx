import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { CreateTableForm } from '@/components/app/form'

export default function CreateTableDialog() {
  const { t } = useTranslation(['table'])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="icon" />
          {t('table.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] rounded-md px-6 pb-6 sm:max-w-[36%]">
        <DialogHeader>
          <DialogTitle>{t('table.create')}</DialogTitle>
          <DialogDescription>
            {t('table.createTableDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateTableForm onSubmit={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
