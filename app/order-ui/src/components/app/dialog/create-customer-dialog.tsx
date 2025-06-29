import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
        <Button className="w-full gap-1" onClick={() => setIsOpen(true)}>
          {t('customer.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[90%] rounded-md p-0 sm:max-w-[50%]">
        <DialogHeader className="p-4">
          <DialogTitle>{t('customer.create')}</DialogTitle>
          <DialogDescription>
            {t('customer.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateCustomerForm onSubmit={handleSubmit} />

        {/* Footer (sticky outside scroll) */}
        <DialogFooter className="flex justify-end p-4 border-t">
          <Button type="submit" form="create-customer-form">
            {t('customer.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
