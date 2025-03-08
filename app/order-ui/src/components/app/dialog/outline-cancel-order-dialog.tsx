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

import { IOrder } from '@/types'
import { useDeleteOrder } from '@/hooks'
import { showToast } from '@/utils'

export default function OutlineCancelOrderDialog({
  order,
  onSuccess,
}: {
  order: IOrder
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const { t: tToast } = useTranslation('toast')
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteOrder } = useDeleteOrder()

  const handleSubmit = (orderSlug: string) => {
    deleteOrder(orderSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['orders'],
        })
        setIsOpen(false)
        showToast(tToast('toast.handleCancelOrderSuccess'))
        onSuccess?.()
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full mt-1" asChild>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-1 px-2 text-sm transition-all duration-300 bg-destructive/15 text-destructive hover:bg-destructive/30 hover:text-destructive"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 />
            {t('order.cancelOrder')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
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
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => order && handleSubmit(order.slug || '')}
          >
            {tCommon('common.confirmCancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
