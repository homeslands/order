import { useState } from 'react'
import { Gift, ShoppingCart, CoinsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Button,
  QuantityControl,
  ScrollArea,
} from '@/components/ui'

import { IGiftCard } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'
import { useGiftCardStore } from '@/stores'

interface GiftCardSelectedDrawerProps {
  selectedCard: IGiftCard
  trigger?: React.ReactNode
  onAddToCart?: (card: IGiftCard, quantity: number) => void
}

export function GiftCardSelectedDrawer({
  selectedCard,
  trigger,
}: GiftCardSelectedDrawerProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const { setGiftCardItem } = useGiftCardStore()

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 10)) // Limit to 10 items max
  }

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)) // Minimum 1 item
  }
  const handleAddToCart = () => {
    const cartItem = {
      id: `gift_card_${Date.now().toString(36)}`,
      slug: selectedCard.slug,
      title: selectedCard.title,
      image: selectedCard.image,
      description: selectedCard.description,
      points: selectedCard.points,
      price: selectedCard.price,
      quantity,
    }

    setGiftCardItem(cartItem)
    setIsOpen(false)
  }

  // Reset quantity when selectedCard changes or drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setQuantity(1) // Reset quantity when opening
    }
    setIsOpen(open)
  }
  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="flex items-center gap-[0px] rounded-full px-4"
          >
            <span className="text-xl font-medium">+</span>
            <Gift className="h-4 w-4" />
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <ScrollArea className="max-h-[80vh] px-4 pt-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                {selectedCard.image ? (
                  <img
                    src={`${publicFileURL}/${selectedCard.image}`}
                    alt={selectedCard.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                    <Gift className="h-10 w-10 text-primary" />
                  </div>
                )}
              </div>{' '}
              <div className="flex-grow">
                <div
                  className="max-h-[10vh] overflow-auto text-lg font-medium"
                  title={selectedCard.title}
                >
                  {selectedCard.title}
                </div>
                <div
                  className="mt-1 max-h-[50vh] overflow-auto whitespace-normal break-words text-sm text-gray-600"
                  title={selectedCard.description}
                >
                  {selectedCard.description}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CoinsIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(selectedCard.points * quantity, '')}
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(selectedCard.price * quantity)}
              </span>
            </div>

            <div className="mb-5 flex w-full items-center justify-between">
              <QuantityControl
                quantity={quantity}
                onIncrease={handleIncrement}
                onDecrease={handleDecrement}
                orientation="horizontal"
                size="md"
                min={1}
                max={10}
                className="flex justify-start"
              />
              <Button
                size="sm"
                className="ml-auto flex whitespace-nowrap rounded-full px-5"
                onClick={handleAddToCart}
              >
                {' '}
                <ShoppingCart className="mr-1 h-4 w-4" />
                <span>{t('giftCard.addToCart')}</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default GiftCardSelectedDrawer
