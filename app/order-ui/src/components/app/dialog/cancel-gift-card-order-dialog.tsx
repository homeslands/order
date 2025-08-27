import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, TriangleAlert, XCircleIcon } from 'lucide-react'

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
  isLoading?: boolean
  disabled?: boolean
  hideLabel?: boolean
  hideIcon?: boolean
  className?: string
  onConfirm: () => void,
  onClick?: (e: MouseEvent) => void

}

export default function CancelGiftCardOrderDialog({
  isLoading = false,
  disabled = false,
  hideLabel = false,
  hideIcon = false,
  className = "",
  onConfirm
}: CancelCardOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation(['giftCard', 'common'])

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {!hideLabel ?

          <Button
            onClick={stop}
            variant="outline"
            disabled={disabled}
            className={`group border-destructive/50 text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-md dark:border-red-500/50 dark:text-white dark:hover:border-red-500 dark:hover:bg-red-500 dark:hover:text-white ${className}`}
          >
            {!hideIcon &&
              <X className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            }
            {t('giftCard.cancelOrder')}
          </Button> :
          <XCircleIcon className="text-sm text-red-500" />
        }
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive dark:text-red-400">
            <TriangleAlert />
            {t('giftCard.confirmCancelOrder', 'Confirm Cancel Order')}
          </DialogTitle>
          <DialogDescription className="rounded-md bg-destructive/10 p-2 text-destructive dark:bg-red-500/20 dark:text-red-300">
            {t(
              'giftCard.cancelOrderWarning',
              'Are you sure you want to cancel this gift card order? This action cannot be undone. Your card selection will be restored to the cart.',
            )}
          </DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {t(
              'giftCard.cancelOrderNote',
              'After cancelling, you can select the same gift card again to create a new order.',
            )}
          </p>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            disabled={isLoading}
          >
            {t('giftCard.cardOrder.goBack')}
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleConfirm()
            }}
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
