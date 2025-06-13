import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, TriangleAlert } from 'lucide-react'

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

interface CancelCardOrderDialogProps {
  onConfirm: () => void
  isLoading?: boolean
  disabled?: boolean
}

export default function CancelGiftCardOrderDialog({
  onConfirm,
  isLoading = false,
  disabled = false,
}: CancelCardOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation(['giftCard', 'common'])

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="group border-destructive/50 text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-md"
        >
          <X className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          {t('giftCard.cancelOrder', 'Cancel Order')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert />
            {t('giftCard.confirmCancelOrder', 'Confirm Cancel Order')}
          </DialogTitle>
          <DialogDescription className="rounded-md bg-destructive/10 p-2 text-destructive">
            {t(
              'giftCard.cancelOrderWarning',
              'Are you sure you want to cancel this gift card order? This action cannot be undone. Your card selection will be restored to the cart.',
            )}
          </DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-sm text-muted-foreground">
            {t(
              'giftCard.cancelOrderNote',
              'After cancelling, you can select the same gift card again to create a new order.',
            )}
          </p>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            {t('common.goBack', 'Go Back')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? t('common.cancelling', 'Cancelling...')
              : t('giftCard.cancelOrder', 'Cancel Order')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
