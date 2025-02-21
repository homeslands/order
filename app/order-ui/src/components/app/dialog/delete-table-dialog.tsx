import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2, TriangleAlert } from 'lucide-react'

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

import { ITable } from '@/types'

import { useDeleteTable } from '@/hooks'
import { showToast } from '@/utils'

interface DeleteTableDialogProps {
  table: ITable | null
  onContextOpen?: () => void
}

export default function DeleteTableDialog({
  table,
  onContextOpen,
}: DeleteTableDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['table'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteTable } = useDeleteTable()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (tableSlug: string) => {
    deleteTable(tableSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['tables'],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteTableSuccess'))
      },
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (onContextOpen && isOpen) onContextOpen()
      }}
    >
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex justify-start w-full gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('table.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('table.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('table.deleteTableWarning1')}{' '}
            <span className="font-bold">{table?.name}</span> <br />
            {t('table.deleteTableConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          {table && (
            <Button
              variant="destructive"
              onClick={() => handleSubmit(table.slug)}
            >
              {tCommon('common.confirmDelete')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
