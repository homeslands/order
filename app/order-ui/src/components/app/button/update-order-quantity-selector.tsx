import React from 'react'
import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui'
import { useUpdateOrderStore } from '@/stores'
import { IOrderDetail, IOrderItem } from '@/types'

interface QuantitySelectorProps {
  cartItem: IOrderDetail | IOrderItem
}

export default function UpdateOrderQuantitySelector({ cartItem }: QuantitySelectorProps) {
  const [quantity, setQuantity] = React.useState(cartItem.quantity)
  const { updateOrderItemQuantity } = useUpdateOrderStore()
  // const {mutate: updateOrderItemQuantity} = useAddNewOrderItem(updateOrderItemQuantity)

  const handleIncrement = () => {
    setQuantity((prev) => {
      const newQuantity = prev + 1
      updateOrderItemQuantity(cartItem.id!, newQuantity)
      return newQuantity
    })
  }

  const handleDecrement = () => {
    setQuantity((prev) => {
      const newQuantity = Math.max(prev - 1, 1)
      updateOrderItemQuantity(cartItem.id!, newQuantity)
      return newQuantity
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        className="p-1 rounded-full border h-fit w-fit hover:bg-gray-100"
      >
        <Minus size={12} />
      </Button>
      <span className="w-4 text-xs text-center">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        className="p-1 rounded-full border h-fit w-fit hover:bg-gray-100"
      >
        <Plus size={12} />
      </Button>
    </div>
  )
}
