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
import { IOrderItem } from '@/types'
import { useCartItemStore } from '@/stores'

interface DialogDeleteCartItemProps {
  cartItem: IOrderItem
}

export default function DeleteCartItemDialog({
  cartItem,
}: DialogDeleteCartItemProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const { removeCartItem } = useCartItemStore()

  const handleDelete = (cartItemId: string) => {
    setIsOpen(false)
    removeCartItem(cartItemId)
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
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="name" className="leading-5 text-left">
              {t('order.deleteContent')} <strong>{cartItem.name}</strong>
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
            onClick={() => handleDelete(cartItem.id)} // Truyền vào đúng id của orderItem
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
