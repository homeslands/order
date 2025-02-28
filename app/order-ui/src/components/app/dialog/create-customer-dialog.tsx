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

import { CreateCustomerForm } from '@/components/app/form'

export default function CreateCustomerDialog() {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="icon" />
          {t('customer.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] rounded-md px-6 sm:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>{t('customer.create')}</DialogTitle>
          <DialogDescription>
            {t('customer.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateCustomerForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
