import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLineIcon } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { UpdateCustomerForm } from '@/components/app/form'
import { IUserInfo } from '@/types'

interface IUpdateCustomerDialogProps {
  customer: IUserInfo
}

export default function UpdateCustomerDialog({
  customer,
}: IUpdateCustomerDialogProps) {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex w-full items-center justify-start">
        <Button
          variant="ghost"
          className="h-10 gap-1 px-2 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PenLineIcon className="icon" />
          {t('customer.update')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('customer.update')}</DialogTitle>
          <DialogDescription>
            {t('customer.updateDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateCustomerForm customer={customer} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
