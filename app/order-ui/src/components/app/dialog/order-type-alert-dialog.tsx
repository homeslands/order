import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { TriangleAlertIcon } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function OrderTypeAlertDialog({
  open,
  onCancel,
}: React.PropsWithChildren<{
  open: boolean
  onCancel: () => void
}>) {
  const { t } = useTranslation(['table'])
  const { t: tCommon } = useTranslation(['common'])
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="border-b border-destructive pb-4 text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlertIcon className="h-6 w-6" />
              {tCommon('common.warning')}
            </div>
          </DialogTitle>
          <div className="py-4 text-sm text-muted-foreground">
            {t('table.takeOutOrderAlert')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="default" onClick={onCancel}>
            {tCommon('common.understand')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
