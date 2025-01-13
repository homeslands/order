import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, TriangleAlert } from 'lucide-react'

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

import { IUserInfo } from '@/types'

import { useResetPassword } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'

export default function ResetPasswordDialog({ user }: { user: IUserInfo }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['user'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: resetPassword } = useResetPassword()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (user: string) => {
    resetPassword(user, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['customers'],
        })
        setIsOpen(false)
        showToast(tToast('toast.resetPasswordSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex w-full justify-start" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <KeyRound className="icon" />
            {t('users.resetPassword')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      {user.email && (
        <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4">
              <div className="flex items-center gap-2 border-destructive text-destructive">
                <TriangleAlert className="h-6 w-6" />
                {t('users.resetPassword')}
              </div>
            </DialogTitle>
            <DialogDescription className="rounded-md bg-red-100 p-2 text-destructive">
              {tCommon('common.deleteNote')}
            </DialogDescription>

            <div className="py-4 text-sm text-gray-500">
              {t('users.resetPasswordContent')}{' '}
              <span className="font-bold">
                {user?.firstName} {user?.lastName}
              </span>
              {t('users.resetPasswordContent2')}
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {tCommon('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => user && handleSubmit(user.slug || '')}
            >
              {tCommon('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
      {!user.email && (
        <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4">
              <div className="flex items-center gap-2 border-destructive text-destructive">
                <TriangleAlert className="h-6 w-6" />
                {t('users.resetPassword')}
              </div>
            </DialogTitle>
            <DialogDescription className="rounded-md bg-red-100 p-2 text-destructive">
              {tCommon('common.deleteNote')}
            </DialogDescription>

            <div className="py-4 text-sm text-gray-500">
              {t('users.userEmailNotFound')}{' '}
              <span className="font-bold">
                {user?.firstName} {user?.lastName}
              </span>
              <br />
              {t('users.resetPasswordNotAvailable')}
            </div>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  )
}
