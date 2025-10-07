import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  DialogFooter,
} from '@/components/ui'

import { showToast } from '@/utils'
import { useDeleteUserGroupMember } from '@/hooks'
import { IUserGroupMember } from '@/types'
import { QUERYKEY } from '@/constants'

export default function DeleteUserGroupMemberDialog({ userGroupMember }: { userGroupMember: IUserGroupMember }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteUserGroupMember } = useDeleteUserGroupMember()

  const handleDeleteUserGroup = () => {
    deleteUserGroupMember(userGroupMember.slug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.userGroupMembers],
          exact: false,
          refetchType: 'all'
        })
        showToast(tToast('toast.deleteUserGroupMemberSuccess'))
        setIsOpen(false)
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <Button
          variant="ghost"
          className="gap-1 px-2 text-sm bg-destructive/15 text-destructive hover:bg-destructive/30 hover:text-destructive"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="icon" />
          {t('customer.userGroup.delete')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[18rem] overflow-hidden rounded-lg transition-all duration-300 hover:overflow-y-auto sm:max-h-[32rem] sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>{t('customer.userGroup.delete')}</DialogTitle>
          <DialogDescription>{t('customer.userGroup.deleteDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4 text-sm text-muted-foreground">
          <div>
            <span>{t('customer.userGroup.deleteUserGroupMemberContent')} <strong>{userGroupMember?.user?.firstName} {userGroupMember?.user?.lastName}</strong></span>
            <span>{t('customer.userGroup.deleteUserGroupMemberContent2')} <strong>{userGroupMember?.userGroup?.name}</strong></span>
          </div>
          <span>{t('customer.userGroup.deleteUserGroupMemberContent3')}</span>
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-end">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsOpen(false)}
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => handleDeleteUserGroup()}
          >
            {tCommon('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
