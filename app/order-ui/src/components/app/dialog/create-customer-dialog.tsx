import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import { useCartItemStore } from '@/stores'
export default function CreateCustomerDialog() {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems } = useCartItemStore()
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={cartItems?.ownerFullName !== '' && cartItems?.ownerPhoneNumber !== ''}
          className="gap-1 w-full" onClick={() => setIsOpen(true)}>
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
      </DialogContent>
    </Dialog>
  )
}
