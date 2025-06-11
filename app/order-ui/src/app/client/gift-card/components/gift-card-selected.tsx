import { motion } from 'framer-motion'
import { Gift, Star, ShoppingCart, Maximize2, Minimize2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'

import { IGiftCard } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'
import { truncate } from 'lodash'
import { Button, QuantityControl } from '@/components/ui'
import { useIsMobile } from '@/hooks'

interface GiftCardSelectedProps {
  selectedCard: IGiftCard
  onClose: () => void
}

export function GiftCardSelected({
  selectedCard,
  onClose,
}: GiftCardSelectedProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const isMobile = useIsMobile()
  const [quantity, setQuantity] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Reset quantity when selectedCard changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedCard])

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 10)) // Limit to 10 items max
  }
  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)) // Minimum 1 item
  }
  const handleAddToCart = () => {
    onClose()
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed z-[100] overflow-y-auto bg-white shadow-lg ${
        isFullScreen
          ? 'inset-0 px-4 pb-6 pt-4'
          : 'bottom-0 left-0 right-0 border-t border-primary/20 px-4 pb-6 pt-4 md:px-8'
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {' '}
          <div className="flex flex-row items-end justify-between gap-2">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg md:h-32 md:w-32">
              {selectedCard.image ? (
                <img
                  src={`${publicFileURL}/${selectedCard.image}`}
                  alt={selectedCard.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <div
              title={selectedCard.title}
              className={`${isFullScreen ? 'whitespace-normal' : ''} text-xl hover:cursor-pointer md:text-2xl`}
            >
              {selectedCard.title.length > 55 && !isFullScreen
                ? truncate(selectedCard.title, { length: 55 })
                : selectedCard.title}
            </div>
            <div
              title={selectedCard.description}
              className={`mt-1 ${isFullScreen ? '' : `line-clamp-2 ${isMobile ? 'h-10' : 'h-12'}`} mb-2 overflow-y-auto whitespace-normal text-sm text-gray-600 hover:cursor-pointer`}
            >
              {selectedCard.description}
            </div>
            {/* Quantity controls for mobile */}
            {isMobile && (
              <div className="flex w-full items-center justify-between">
                <QuantityControl
                  quantity={quantity}
                  onIncrease={handleIncrement}
                  onDecrease={handleDecrement}
                  orientation="horizontal"
                  size="sm"
                  min={1}
                  max={10}
                  className="flex justify-end"
                />
                <Button
                  size="sm"
                  className="ml-auto flex whitespace-nowrap rounded-full px-5"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-2 w-2" />
                </Button>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(selectedCard.points * quantity, '')}{' '}
                  {t('giftCard.coin')}
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(selectedCard.price * quantity)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <QuantityControl
                    quantity={quantity}
                    onIncrease={handleIncrement}
                    onDecrease={handleDecrement}
                    min={1}
                    max={10}
                  />
                </div>
              )}{' '}
              <Button
                size="lg"
                className="rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {isMobile ? (
                  <span>{t('giftCard.buyNow')}</span>
                ) : (
                  <span>{t('giftCard.addToCart')}</span>
                )}
              </Button>
            </div>
          </div>{' '}
          <div className="absolute right-5 top-3 flex gap-3 md:right-8 md:top-4">
            <button
              className="flex items-center justify-center text-gray-400 hover:text-gray-600"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? 'Minimize' : 'Maximize'}
            >
              {isFullScreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              className="text-lg text-gray-400 hover:text-gray-600 md:text-xl"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
