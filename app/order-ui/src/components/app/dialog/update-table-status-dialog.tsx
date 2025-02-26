import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PenSquareIcon, TriangleAlert } from 'lucide-react'

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

import { ITable } from '@/types'
import { useUpdateTableStatus } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY, TableStatus } from '@/constants'
import { useUserStore } from '@/stores'

interface IUpdateTableStatusDialogProps {
  table: ITable
}

export default function UpdateTableStatusDialog({
  table,
}: IUpdateTableStatusDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['table'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { getUserInfo } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: updateTableStatus } = useUpdateTableStatus()

  const handleSubmit = (tableId: string, currentStatus: TableStatus) => {
    if (!tableId) return
    const newStatus = currentStatus === TableStatus.AVAILABLE
      ? TableStatus.RESERVED
      : TableStatus.AVAILABLE

    updateTableStatus(
      { slug: tableId, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERYKEY.tables, getUserInfo()?.branch?.slug],
          })
          showToast(tToast('toast.updateTableStatusSuccess'))
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
          className="flex justify-start w-full gap-1 px-2 text-sm"
          onClick={() => setIsOpen(true)}>
          <PenSquareIcon className="icon" />
          {t('table.updateStatus')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>

          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('table.updateStatus')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('table.confirmUpdateStatus')}
            <br />
            {`${t('table.currentInfo')}: ${table.name} - ${table.status === TableStatus.AVAILABLE ? t('table.available') : t('table.reserved')
              }`}
            <br />
            {t('table.willChangeStatus')}: {
              table.status === TableStatus.AVAILABLE ? (
                <span className="font-bold text-primary">{t('table.reserved')}</span>
              ) : (
                <span className="font-bold text-primary">{t('table.available')}</span>
              )
            }
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={() => table && handleSubmit(table.slug, table.status)}
            className="min-w-24"
          >
            {t('table.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
