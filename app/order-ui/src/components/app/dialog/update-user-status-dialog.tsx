import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Lock, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IUserInfo } from '@/types'
import { useLockUser } from '@/hooks'
import { showToast } from '@/utils'

interface IUpdateUserStatusDialogProps {
  user: IUserInfo
}

export default function UpdateUserStatusDialog({
  user,
}: IUpdateUserStatusDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: updateUserStatus } = useLockUser()

  const handleSubmit = (userId: string) => {
    if (!userId) return

    updateUserStatus(
      userId,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['users'],
          })
          showToast(tToast('toast.updateUserStatusSuccess'))
          setIsOpen(false)
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex gap-1 justify-start px-2 w-full text-sm"
          onClick={() => setIsOpen(true)}>
          <Lock className="w-4 h-4" />
          {user?.isActive ? t('customer.lockUser') : t('customer.unlockUser')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>

          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {user?.isActive ? t('customer.lockUser') : t('customer.unlockUser')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('customer.youAreAboutTo')}{' '}
            <span className={`font-bold ${user?.isActive ? 'text-destructive' : 'text-green-500'}`}>
              {user?.isActive ? t('customer.lockKeyword') : t('customer.unlockKeyword')}
            </span>{' '} {user?.firstName} {user?.lastName}
            <br />
            <span className="font-semibold text-foreground">
              {user?.isActive ? t('customer.lockConfirm') : t('customer.unlockConfirm')}
            </span>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={() => user && handleSubmit(user.slug)}
            className="min-w-24"
          >
            {tCommon('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
