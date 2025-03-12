import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { IOrderDetail, IUpdateOrderItemRequest } from '@/types'
import { useUpdateOrderItem } from '@/hooks'

interface QuantitySelectorProps {
  orderItem: IOrderDetail
  onSuccess: () => void
}

export default function UpdateOrderQuantity({ orderItem, onSuccess }: QuantitySelectorProps) {
  const { mutate: updateOrderItemQuantity } = useUpdateOrderItem()
  const handleUpdateQuantity = (action: string) => {
    const quantity = action === "increment" ? +orderItem.quantity + 1 : +orderItem.quantity - 1
    if (quantity <= 0) return
    const data: IUpdateOrderItemRequest = {
      quantity: quantity,
      variant: orderItem.variant.slug,
      promotion: orderItem.promotion?.slug,
      action: action,
    }
    updateOrderItemQuantity({ slug: orderItem.slug, data: data }, {
      onSuccess: () => {
        onSuccess()
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleUpdateQuantity("decrement")}
        className="p-1 border rounded-full h-fit w-fit hover:bg-gray-100"
      >
        <Minus size={12} />
      </Button>
      <span className="w-4 text-xs text-center">{orderItem?.quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleUpdateQuantity("increment")}
        className="p-1 border rounded-full h-fit w-fit hover:bg-gray-100"
      >
        <Plus size={12} />
      </Button>
    </div>
  )
}
