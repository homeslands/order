import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, TriangleAlert } from 'lucide-react'

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

import { IOrder } from '@/types'
import { useDeletePublicOrder } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'

export default function CancelPublicOrderDialog({
  order,
}: {
  order: IOrder
}) {
  const { t: tToast } = useTranslation('toast')
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deletePublicOrder, isPending } = useDeletePublicOrder()
  const queryClient = useQueryClient();
  const handleSubmit = (orderSlug: string) => {
    deletePublicOrder(orderSlug, {
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['orders-public'] });
          showToast(tToast('toast.handleCancelOrderSuccess'))
          setIsOpen(false)
        }, 500);
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-center w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="gap-1 px-2 text-sm text-gray-500 bg-white border border-gray-500 hover:bg-gray-500 hover:text-white"
            onClick={() => setIsOpen(true)}
          >
            {t('order.cancelOrder')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('order.cancelOrder')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 bg-red-100 rounded-md text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('order.cancelOrderWarning')} <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => order && handleSubmit(order.slug || '')}
            disabled={isPending}
          >
            {isPending ? <div className="flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              {tCommon('common.confirmCancel')}
            </div> : tCommon('common.confirmCancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
