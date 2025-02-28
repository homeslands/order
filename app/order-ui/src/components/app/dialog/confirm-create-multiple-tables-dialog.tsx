import { useQueryClient } from '@tanstack/react-query'
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

import { ICreateMultipleTablesRequest } from '@/types'
import { useCreateMultipleTables } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useUserStore } from '@/stores'

interface IConfirmCreateMultipleTablesDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  tables: ICreateMultipleTablesRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmCreateMultipleTablesDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  tables,
  disabled,
  onSuccess
}: IConfirmCreateMultipleTablesDialogProps) {
  const queryClient = useQueryClient()
  const { userInfo } = useUserStore()
  const { t } = useTranslation(['table'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: createMultipleTables } = useCreateMultipleTables()

  const handleSubmit = (tables: ICreateMultipleTablesRequest) => {
    if (!tables) return
    createMultipleTables(tables, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.tables, userInfo?.branch?.slug],
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.()
        showToast(tToast('toast.createMultipleTablesSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full sm:w-[10rem]"
          onClick={() => onOpenChange(true)}
        >
          {t('table.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('table.create')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('table.confirmCreateMultipleTables')}
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
          <Button onClick={() => tables && handleSubmit(tables)}>
            {t('table.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
