import { useState } from 'react'
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
  Label,
} from '@/components/ui'
import { IOrderDetail } from '@/types'
import { useDeleteOrderItem } from '@/hooks'
import { showToast } from '@/utils'

interface DialogDeleteCartItemProps {
  onSubmit: () => void
  orderItem: IOrderDetail
}

export default function RemoveOrderItemInUpdateOrderDialog({
  onSubmit,
  orderItem,
}: DialogDeleteCartItemProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteOrderItem } = useDeleteOrderItem()

  const handleDelete = (orderItemSlug: string) => {
    deleteOrderItem(orderItemSlug, {
      onSuccess: () => {
        showToast(tToast('toast.deleteOrderItemSuccess'))
        setIsOpen(false)
        onSubmit()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 size={20} className="text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert />
            {t('order.deleteItem')}
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-destructive/10 text-destructive">
            {t('order.deleteNote')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="name" className="leading-5 text-left">
              {t('order.deleteContent')} <strong>{orderItem.variant.product.name}</strong>
              {t('order.deleteContent2')}
            </Label>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(orderItem.slug)} // Truyền vào đúng id của orderItem
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
