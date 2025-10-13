import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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

export default function ResetEmployeePasswordDialog({ user }: { user?: IUserInfo | undefined }) {
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
      <DialogTrigger className="flex justify-start" asChild>
        <Button
          variant="ghost"
          className="gap-1 px-2 h-10 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <KeyRound className="icon" />
          {t('users.resetPassword')}
        </Button>
      </DialogTrigger>

      {user?.email && (
        <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle className="pb-4 border-b">
              <div className="flex gap-2 items-center border-destructive text-destructive">
                <TriangleAlert className="w-6 h-6" />
                {t('users.resetPassword')}
              </div>
            </DialogTitle>
            <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
              {tCommon('common.deleteNote')}
            </DialogDescription>

            <div className="py-4 text-sm text-muted-foreground">
              {t('users.resetPasswordContent')}{' '}
              <span className="font-bold">
                {user?.firstName} {user?.lastName}
              </span>
              {t('users.resetPasswordContent2')}
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-center">
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
      {!user?.email && (
        <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
          <DialogHeader>
            <DialogTitle className="pb-4 border-b">
              <div className="flex gap-2 items-center border-destructive text-destructive">
                <TriangleAlert className="w-6 h-6" />
                {t('users.resetPassword')}
              </div>
            </DialogTitle>
            <DialogDescription className="p-2 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/30 hover:text-destructive">
              {tCommon('common.deleteNote')}
            </DialogDescription>

            <div className="py-4 text-sm text-muted-foreground">
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
