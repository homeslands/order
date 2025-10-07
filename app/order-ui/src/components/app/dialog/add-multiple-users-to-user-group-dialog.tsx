import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  ScrollArea,
} from '@/components/ui'
import { IUserInfo } from '@/types'
import { AddMultipleUsersToUserGroupForm } from '@/components/app/form'

interface AddMultipleUsersToUserGroupDialogProps {
  disabled: boolean
  users: IUserInfo[]
  onSubmit: (isOpen: boolean) => void
}

export default function AddMultipleUsersToUserGroupDialog({
  disabled,
  users,
  onSubmit,
}: AddMultipleUsersToUserGroupDialogProps) {
  const { t } = useTranslation(['customer'])
  const [isOpen, setIsOpen] = useState(false)
  const [formRef, setFormRef] = useState<{ submitForm: () => void } | null>(null)

  const handleSubmit = (isDialogOpen: boolean) => {
    setIsOpen(isDialogOpen)
    onSubmit(isDialogOpen)
  }

  const handleFormSubmit = () => {
    if (formRef) {
      formRef.submitForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-1 h-10 text-sm"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        >
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
            onRef={setFormRef}
          />
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleFormSubmit}>
            {t('customer.userGroup.addMember')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
