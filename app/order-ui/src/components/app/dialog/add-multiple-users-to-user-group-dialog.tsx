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
import { IUserInfo } from '@/types'
import { AddMultipleUsersToUserGroupForm } from '@/components/app/form'

interface AddMultipleUsersToUserGroupDialogProps {
  users: IUserInfo[]
  onSubmit: (isOpen: boolean) => void
}

export default function AddMultipleUsersToUserGroupDialog({
  users,
  onSubmit,
}: AddMultipleUsersToUserGroupDialogProps) {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (isDialogOpen: boolean) => {
    setIsOpen(isDialogOpen)
    onSubmit(isDialogOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-1 h-10 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PlusCircledIcon className="icon" />
          {t('customer.userGroup.addMember')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[44rem]">
        <DialogHeader>
          <DialogTitle>{t('customer.userGroup.addMember')}</DialogTitle>
          <DialogDescription>
            {t('customer.userGroup.addMemberDescription')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[24rem]">
          <AddMultipleUsersToUserGroupForm
            onSubmit={handleSubmit}
            users={users}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
