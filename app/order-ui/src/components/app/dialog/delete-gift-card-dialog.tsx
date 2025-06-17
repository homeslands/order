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

import { IGiftCard } from '@/types'

import { useDeleteGiftCard } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { Tooltip } from 'react-tooltip'

export default function DeleteGiftCardDialog({
  giftCard,
}: {
  giftCard: IGiftCard
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['giftCard'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteGiftCard, isPending } = useDeleteGiftCard()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (giftCardSlug: string) => {
    deleteGiftCard(giftCardSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.giftCards],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteGiftCardSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex w-full justify-start" asChild>
        <div
          data-tooltip-id="delete-card"
          data-tooltip-content={t('giftCard.delete')}
        >
          <Trash2 className="icon cursor-pointer text-destructive transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" />
          <Tooltip id="delete-card" variant="light" />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="border-b border-destructive pb-4 text-destructive dark:border-red-400 dark:text-red-400">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6" />
              {t('giftCard.delete')}
            </div>
          </DialogTitle>
          <DialogDescription
            className={`rounded-md bg-red-100 p-2 text-destructive dark:bg-red-900/30 dark:text-red-300`}
          >
            {tCommon('common.deleteNote')}
          </DialogDescription>
          <div className="py-4 text-sm text-muted-foreground dark:text-gray-400">
            {t('giftCard.deleteGiftCardWarning1')}{' '}
            <span className="font-bold text-gray-900 dark:text-white">
              {giftCard?.title}
            </span>
            <br />
            <br />
            {t('giftCard.deleteGiftCardConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => giftCard && handleSubmit(giftCard.slug || '')}
            disabled={isPending}
          >
            {isPending ? (
              <>{tCommon('common.processing')}</>
            ) : (
              <>{tCommon('common.confirmDelete')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
