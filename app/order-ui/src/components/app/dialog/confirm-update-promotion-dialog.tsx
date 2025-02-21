import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IUpdatePromotionRequest } from '@/types'
import { useUpdatePromotion } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdatePromotionDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  promotion: IUpdatePromotionRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmUpdatePromotionDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  promotion,
  disabled,
  onSuccess
}: IConfirmUpdatePromotionDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['promotion'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: updatePromotion } = useUpdatePromotion()

  const handleSubmit = (promotion: IUpdatePromotionRequest) => {
    if (!promotion) return
    updatePromotion(promotion, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.promotions]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        onSuccess?.()
        showToast(tToast('toast.updatePromotionSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full sm:w-[10rem]"
          onClick={() => onOpenChange(true)}
        >
          {t('promotion.update')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('promotion.update')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('promotion.confirmUpdatePromotion')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => promotion && handleSubmit(promotion)}>
            {t('promotion.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
