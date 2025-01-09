import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SquareMousePointer } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { UserInfoForm } from '@/components/app/form'
import { IUserInfo } from '@/types'

interface IUserInfoDialogProps {
  user?: IUserInfo
}

export default function UserInfoDialog({ user }: IUserInfoDialogProps) {
  const { t } = useTranslation(['user'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex w-full justify-start">
        <Button
          variant="ghost"
          className="h-10 gap-1 px-2 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <SquareMousePointer className="icon" />
          {t('users.viewDetail')}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-4/5 w-4/5 overflow-y-auto rounded-md px-6 sm:max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>{t('users.detailInfo')}</DialogTitle>
          <DialogDescription>
            {t('users.detailInfoDescription')}
          </DialogDescription>
        </DialogHeader>
        <UserInfoForm user={user} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
