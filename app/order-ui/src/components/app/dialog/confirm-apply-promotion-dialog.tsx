import { useQueryClient } from '@tanstack/react-query'
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
  DialogTrigger,
} from '@/components/ui'

import { IApplyPromotionRequest } from '@/types'
import { useApplyPromotion } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmApplyPromotionDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  applyPromotionData: IApplyPromotionRequest | null
  disabled?: boolean
}

export default function ConfirmApplyPromotionDialog({
  isOpen,
  onOpenChange,
  onCloseSheet,
  applyPromotionData,
  disabled,
}: IConfirmApplyPromotionDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['promotion'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: applyPromotion } = useApplyPromotion()

  const handleSubmit = (promotion: IApplyPromotionRequest) => {
    if (!promotion) return
    applyPromotion(promotion, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.promotions]
        })
        onOpenChange(false)
        onCloseSheet() // Close the sheet after success
        showToast(tToast('toast.applyPromotionSuccess'))
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
          {t('promotion.apply')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>

          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('promotion.applyPromotion')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('promotion.confirmApplyPromotion')}
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
          <Button onClick={() => applyPromotionData && handleSubmit(applyPromotionData)}>
            {t('promotion.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
