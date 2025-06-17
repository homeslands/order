import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GiftCardType } from '@/constants'

interface QuantityControlProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  orientation?: 'horizontal' | 'vertical'
  giftCardType?: string
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 100,
  size = 'md',
  className,
  orientation = 'horizontal',
  giftCardType
}: QuantityControlProps) {

  const sizes = {
    sm: {
      button: 'h-7 w-7',
      icon: 'h-3 w-3',
      text: 'text-xs w-6',
    },
    md: {
      button: 'h-9 w-9',
      icon: 'h-4 w-4',
      text: 'text-sm w-8',
    },
    lg: {
      button: 'h-10 w-10',
      icon: 'h-5 w-5',
      text: 'text-base w-10',
    },
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      className={cn(
        'flex items-center',
        isVertical ? 'flex-col' : 'flex-row',
        className,
      )}
    >      <button
      type="button"
      onClick={onDecrease}
      disabled={quantity <= min || (giftCardType === GiftCardType.GIFT)}
      className={cn(
        'flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50',
        isVertical
          ? 'rounded-t-md border border-input'
          : 'rounded-l-md border border-input',
        sizes[size].button,
      )}
    >
        <Minus className={sizes[size].icon} />
      </button>
      <span
        className={cn(
          'flex items-center justify-center text-center font-medium',
          isVertical
            ? 'my-0 border-x border-input'
            : 'mx-0 border-y border-input',
          sizes[size].text,
          sizes[size].button,
        )}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max || (giftCardType === GiftCardType.GIFT)}
        className={cn(
          'flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50',
          isVertical
            ? 'rounded-b-md border border-input'
            : 'rounded-r-md border border-input',
          sizes[size].button,
        )}
      >
        <Plus className={sizes[size].icon} />
      </button>
    </div>
  )
}