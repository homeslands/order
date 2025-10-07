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

import { UpdateUserGroupForm } from '@/components/app/form'
import { IUserGroup } from '@/types'

interface IUpdateUserGroupDialogProps {
  userGroup: IUserGroup
}

export default function UpdateUserGroupDialog({ userGroup }: IUpdateUserGroupDialogProps) {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className='flex justify-start items-center w-full'>
        <Button
          variant="ghost"
          className="gap-1 px-2 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PenLineIcon className="icon" />
          {t('customer.userGroup.update')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('customer.userGroup.update')}</DialogTitle>
          <DialogDescription>
            {t('customer.userGroup.updateDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateUserGroupForm userGroup={userGroup} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
