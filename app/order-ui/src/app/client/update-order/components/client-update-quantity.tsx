import { useState } from 'react'
// import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui'
import { IOrderItem } from '@/types'
import { useOrderFlowStore } from '@/stores'

interface ClientUpdateQuantityProps {
  orderItem: IOrderItem
}

export default function ClientUpdateQuantity({ orderItem }: ClientUpdateQuantityProps) {
  // const { t: tToast } = useTranslation(['toast'])
  const [quantity, setQuantity] = useState(orderItem.quantity)
  // const { mutate: updateOrderItemQuantity } = useUpdateOrderItem()
  const { updateDraftItemQuantity } = useOrderFlowStore()
  // const queryClient = useQueryClient();

  const handleIncrement = () => {
    setQuantity((prev) => {
      const newQuantity = prev + 1
      updateDraftItemQuantity(orderItem.id, newQuantity) // Sử dụng slug thay vì id
      return newQuantity
    })
  }

  const handleDecrement = () => {
    setQuantity((prev) => {
      const newQuantity = Math.max(prev - 1, 1)
      updateDraftItemQuantity(orderItem.id, newQuantity) // Sử dụng slug thay vì id
      return newQuantity
    })
  }

  // const handleUpdateQuantity = (action: string) => {
  //   const quantity = action === "increment" ? +orderItem.quantity + 1 : +orderItem.quantity - 1
  //   if (quantity <= 0) return
  //   const data: IUpdateOrderItemRequest = {
  //     quantity: quantity,
  //     variant: orderItem.variant.slug,
  //     promotion: orderItem.promotion?.slug,
  //     action: action,
  //   }

  //   updateOrderItemQuantity({ slug: orderItem.slug, data: data }, {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ['specific-menu'] });
  //       showToast(tToast('toast.updateQuantitySuccess'))
  //       onSuccess()
  //     }
  //   })
  // }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        className="p-1 rounded-full border border-muted-foreground/30 h-fit w-fit hover:bg-gray-100"
      >
        <Minus size={12} />
      </Button>
      <span className="w-4 text-xs text-center">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        className="p-1 rounded-full border border-muted-foreground/30 h-fit w-fit hover:bg-gray-100"
      >
        <Plus size={12} />
      </Button>
    </div>
    // <div className="flex items-center gap-1.5">
    //   <Button
    //     variant="ghost"
    //     size="icon"
    //     onClick={() => handleUpdateQuantity("decrement")}
    //     className="p-1 rounded-full border h-fit w-fit hover:bg-gray-100"
    //   >
    //     <Minus size={12} />
    //   </Button>
    //   <span className="w-4 text-xs text-center">{orderItem?.quantity}</span>
    //   <Button
    //     variant="ghost"
    //     size="icon"
    //     onClick={() => handleUpdateQuantity("increment")}
    //     className="p-1 rounded-full border h-fit w-fit hover:bg-gray-100"
    //   >
    //     <Plus size={12} />
    //   </Button>
    // </div>
  )
}
