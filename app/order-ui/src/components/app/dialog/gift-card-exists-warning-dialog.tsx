import { useTranslation } from 'react-i18next'
import { TriangleAlert, Gift } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui'

import { IGiftCard } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'

interface IGiftCardExistsWarningDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  selectedCard: IGiftCard
  quantity: number
}

export default function GiftCardExistsWarningDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  selectedCard,
  quantity,
}: IGiftCardExistsWarningDialogProps) {
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <TriangleAlert className="h-5 w-5" />
            {t('giftCard.giftCardExistsWarning')}
          </DialogTitle>
          <DialogDescription className="text-left">
            {t('giftCard.giftCardExistsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            {t('giftCard.giftCardExistsMessage')}
          </p>

          {/* Gift Card Preview */}
          <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              {selectedCard.image ? (
                <img
                  src={`${publicFileURL}/${selectedCard.image}`}
                  alt={selectedCard.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h4 className="line-clamp-2 font-medium text-gray-900">
                {selectedCard.title}
              </h4>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t('giftCard.quantity')}: {quantity}
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(selectedCard.price * quantity)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {t('giftCard.replaceGiftCard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
