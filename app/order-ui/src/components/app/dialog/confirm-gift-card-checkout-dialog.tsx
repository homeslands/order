import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui'

interface IConfirmGiftCardCheckoutDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  disabled?: boolean
}

export default function ConfirmGiftCardCheckoutDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  disabled,
}: IConfirmGiftCardCheckoutDialogProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tCommon } = useTranslation('common')

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[28rem] rounded-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <TriangleAlert className="h-5 w-5" />
            {t('giftCard.confirmCheckout')}
          </DialogTitle>
          <DialogDescription className="text-left dark:text-white text-muted-foreground">
            {t('giftCard.confirmCheckoutDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={disabled}>
            {t('giftCard.confirmPurchase')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
