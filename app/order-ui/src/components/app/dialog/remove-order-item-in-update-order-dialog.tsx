import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
  Label,
} from '@/components/ui'
import { IOrderDetail } from '@/types'
import { useDeleteOrderItem } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTE } from '@/constants'

interface DialogDeleteCartItemProps {
  onSubmit: () => void
  orderItem: IOrderDetail
  totalOrderItems: number
}

export default function RemoveOrderItemInUpdateOrderDialog({
  onSubmit,
  orderItem,
  totalOrderItems,
}: DialogDeleteCartItemProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteOrderItem } = useDeleteOrderItem()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isLastItem = totalOrderItems === 1

  const handleDelete = (orderItemSlug: string) => {
    deleteOrderItem(orderItemSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['specific-menu'] });

        if (isLastItem) {
          showToast(tToast('toast.orderCanceled'))
          navigate(ROUTE.CLIENT_MENU)
        } else {
          showToast(tToast('toast.deleteOrderItemSuccess'))
          setIsOpen(false)
          onSubmit()
        }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 size={20} className="text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert />
            {isLastItem ? t('order.cancelOrder') : t('order.deleteItem')}
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-destructive/10 text-destructive">
            {isLastItem ? t('order.cancelOrderNote') : t('order.deleteNote')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="name" className="leading-5 text-left">
              {isLastItem ? (
                <>
                  {t('order.cancelOrderContent')} <strong>{orderItem.variant.product.name}</strong> {t('order.cancelOrderContent2')}
                </>
              ) : (
                <>
                  {t('order.deleteContent')} <strong>{orderItem.variant.product.name}</strong> {t('order.deleteContent2')}
                </>
              )}
            </Label>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(orderItem.slug)}
          >
            {isLastItem ? tCommon('common.confirmCancel') : tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
