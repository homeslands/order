import { useEffect, useState } from 'react'
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
import { showErrorToast } from '@/utils'

interface DialogDeleteCartItemProps {
  cartItem: IOrderItem
}

export default function DeleteCartItemDialog({
  cartItem,
}: DialogDeleteCartItemProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const { removeCartItem, cartItems, removeVoucher } = useCartItemStore()

  const handleDelete = (cartItemId: string) => {
    setIsOpen(false)
    removeCartItem(cartItemId)
  }

  // use useEffect to check if subtotal is less than minOrderValue of voucher
  useEffect(() => {
    if (cartItems) {
      const subtotal = cartItems.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
      const voucher = cartItems.voucher
      if (subtotal < (voucher?.minOrderValue || 0)) {
        removeVoucher()
        showErrorToast(1004)
        setIsOpen(false)
      }
    }
  }, [cartItems, removeVoucher])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 size={20} className="text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center text-destructive">
            <TriangleAlert />
            {t('order.deleteItem')}
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex gap-4 items-center mt-4">
            <Label htmlFor="name" className="leading-5 text-left">
              {t('order.deleteContent')} <strong>{cartItem.name}</strong>
              {t('order.deleteContent2')}
            </Label>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-end">
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
