import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { ITable } from '@/types'

interface SelectedTableToRemoveDialogProps {
  table: ITable | null
  setSelectedTableId: React.Dispatch<React.SetStateAction<string | undefined>>
  onConfirm: (table: ITable) => void
  onCancel: () => void
}

export default function SelectedTableToRemoveDialog({
  table,
  onConfirm,
  onCancel,
}: SelectedTableToRemoveDialogProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')

  if (!table) return null

  return (
    <Dialog open={!!table} onOpenChange={onCancel}>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('menu.tableNote')}
            </div>
          </DialogTitle>
          <div className="py-4 text-sm text-muted-foreground">
            {t('menu.selectedTableToRemoveWarning')}{' '}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {tCommon('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(table)}>
            {t('menu.confirmRemoveTable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
