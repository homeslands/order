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

interface SelectReservedTableDialogProps {
  table: ITable | null
  setSelectedTableId: React.Dispatch<React.SetStateAction<string | null>>
  onConfirm: (table: ITable) => void
  onCancel: () => void
}

export default function SelectReservedTableDialog({
  table,
  onConfirm,
  onCancel,
}: SelectReservedTableDialogProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')

  if (!table) return null

  return (
    <Dialog open={!!table} onOpenChange={onCancel}>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="border-b border-destructive pb-4 text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6" />
              {t('menu.tableNote')}
            </div>
          </DialogTitle>
          <div className="py-4 text-sm text-muted-foreground">
            {t('menu.selectReservedTableWarning')}{' '}
            <span className="font-bold">{table?.name}</span>
            {t('menu.selectReservedTableWarning2')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {tCommon('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(table)}>
            {t('menu.confirmSelectTable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
