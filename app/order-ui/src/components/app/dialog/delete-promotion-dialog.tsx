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

import { IPromotion } from '@/types'

import { useDeletePromotion } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useUserStore } from '@/stores'

export default function DeletePromotionDialog({ promotion }: { promotion: IPromotion }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['promotion'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { mutate: deletePromotion } = useDeletePromotion()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (promotionSlug: string) => {
    deletePromotion(promotionSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.promotions, userInfo?.branch.slug],
        })
        setIsOpen(false)
        showToast(tToast('toast.deletePromotionSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('promotion.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('promotion.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('promotion.deletePromotionWarning1')}{' '}
            <span className="font-bold">{promotion?.title}</span> <br />
            <br />
            {t('promotion.deletePromotionConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => promotion && handleSubmit(promotion.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
