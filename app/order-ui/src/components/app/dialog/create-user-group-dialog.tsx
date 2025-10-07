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

import { CreateUserGroupForm } from '@/components/app/form'

export default function CreateUserGroupDialog() {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-full" onClick={() => setIsOpen(true)}>
          {t('customer.userGroup.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[90%] rounded-md p-0 sm:max-w-[50%]">
        <DialogHeader className="p-4">
          <DialogTitle>{t('customer.userGroup.create')}</DialogTitle>
          <DialogDescription>
            {t('customer.userGroup.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateUserGroupForm onSubmit={handleSubmit} />

        {/* Footer (sticky outside scroll) */}
        <DialogFooter className="flex justify-end p-4 border-t">
          <Button type="submit" form="create-user-group-form">
            {t('customer.userGroup.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
