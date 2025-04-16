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
import { QUERYKEY } from '@/constants'

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
        setIsOpen(false)
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: [QUERYKEY.tables],
          })
          showToast(tToast('toast.deleteTableSuccess'))
          document.body.style.pointerEvents = 'auto'
        }, 300)
      },
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          document.body.style.pointerEvents = 'auto'
          if (onContextOpen) onContextOpen()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex gap-1 justify-start px-2 w-full text-sm"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="icon" />
          {t('table.delete')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('table.delete')}
            </div>
          </DialogTitle>
          <DialogDescription
            className={`p-2 bg-red-100 rounded-md text-destructive dark:bg-transparent`}
          >
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('table.deleteTableWarning1')}{' '}
            <span className="font-bold">{table?.name}</span> <br />
            {t('table.deleteTableConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
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
