import { useState } from 'react'
import { PencilLine } from 'lucide-react'
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

import { UpdateCustomerProfileForm } from '@/components/app/form'
import { IUserInfo } from '@/types'

interface IUpdateProfileDialogProps {
  userProfile: IUserInfo | undefined
}

export default function UpdateCustomerProfileDialog({
  userProfile,
}: IUpdateProfileDialogProps) {
  const { t } = useTranslation(['profile'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-fit">
        <Button className="gap-1 px-2 text-sm" onClick={() => setIsOpen(true)}>
          <PencilLine className="icon hidden sm:block" />
          <span className="text-xs sm:text-sm">
            {t('profile.updateProfile')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] overflow-y-auto rounded-md px-0 sm:max-w-[56rem]">
        <DialogHeader className="px-6">
          <DialogTitle>{t('profile.updateProfile')}</DialogTitle>
          <DialogDescription>
            {t('profile.updateProfileDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateCustomerProfileForm
          userProfile={userProfile}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
