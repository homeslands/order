import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { ICreatePermissionRequest } from '@/types'
import { useCreatePermission } from '@/hooks'
import { showToast } from '@/utils'
import { useState } from 'react'

interface IConfirmCreatePermissionDialogProps {
  permission: ICreatePermissionRequest | null
  onSuccess?: () => void
}

export default function ConfirmCreatePermissionDialog({
  permission,
  onSuccess
}: IConfirmCreatePermissionDialogProps) {
  const { t } = useTranslation(['role'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: createPermission } = useCreatePermission()
  const [isOpen, onOpenChange] = useState(false)

  const handleSubmit = async () => {
    if (!permission) return
    createPermission(permission, {
      onSuccess: () => {
        onSuccess?.()
        onOpenChange(false)
        showToast(tToast('toast.createPermissionSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={!permission?.createAuthorities?.length && !permission?.deleteAuthorities?.length}
          className="flex items-center w-full text-sm sm:w-[10rem]"
          onClick={() => onOpenChange(true)}
          type="submit"
          form="permission-form"
        >
          {t('role.addPermission')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('role.addPermission')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('role.confirmCreatePermission')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {t('role.addPermission')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
