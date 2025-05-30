import { motion } from 'framer-motion'
import { Gift, ShoppingCart, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'
import { IGiftCard } from '@/types'
import { useIsMobile } from '@/hooks'

interface GiftCardItemProps {
  card: IGiftCard
  index: number
  isSelected: boolean
  onSelect: (card: IGiftCard) => void
  onClose: () => void
}

export default function GiftCardItem({
  card,
  index,
  isSelected,
  onSelect,
  onClose,
}: GiftCardItemProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const isMobile = useIsMobile()

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  }
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={!isMobile ? 'hover' : undefined}
      variants={cardVariants}
      transition={{ delay: index * 0.1 }}
      className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-primary/50 dark:border-gray-700 dark:bg-gray-800 ${
        isMobile
          ? 'flex min-h-[8rem] flex-row justify-between'
          : 'flex min-h-[16rem] flex-col'
      }`}
      onClick={() => onSelect(card)}
    >
      {/* Card Image */}
      <div
        className={`relative overflow-hidden ${
          isMobile ? 'h-full w-24 flex-shrink-0 px-2 py-4' : 'h-48 w-full'
        }`}
      >
        {card.image ? (
          <img
            src={`${publicFileURL}/${card.image}`}
            alt={card.title}
            className={`object-cover ${isMobile ? 'h-full w-full rounded-md' : 'h-full w-full'}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
            <Gift
              className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-16 w-16'}`}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div
        className={`${isMobile ? 'flex flex-1 flex-col justify-between p-2' : 'p-4'}`}
      >
        <div>
          <h3
            className={`${isMobile ? 'text-md line-clamp-1 font-bold' : 'mb-2 text-xl font-bold'} text-gray-900 dark:text-white`}
          >
            {card.title.length > 20
              ? `${card.title.substring(0, 20)}...`
              : card.title}
          </h3>{' '}
          {!isMobile && card.description ? (
            <p className="mb-4 line-clamp-2 h-10 overflow-hidden text-ellipsis text-sm text-gray-600 dark:text-gray-300">
              {card.description.length > 100 ? (
                `${card.description.substring(0, 100)}...`
              ) : (
                <div>
                  <span>{card.description}</span>
                  <span>&nbsp;</span>
                </div>
              )}
            </p>
          ) : !isMobile ? (
            <p className="mb-4 flex h-10 flex-col justify-between text-sm text-gray-400"></p>
          ) : null}
        </div>

        {/* Price */}
        <div
          className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}
        >
          <div className={`flex items-center gap-1 ${isMobile ? 'mb-1' : ''}`}>
            <Star className="h-4 w-4 text-yellow-500" />
            <span
              className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-primary`}
            >
              {new Intl.NumberFormat().format(Number(card.points))}{' '}
              {t('giftCard.coin')}
            </span>
          </div>
          <div
            className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-primary`}
          >
            {formatCurrency(card.price)}
          </div>
        </div>
      </div>

      <div
        className={`flex justify-center ${isMobile ? 'items-end p-2' : 'pb-6'}`}
      >
        <Button
          size={isMobile ? 'sm' : 'lg'}
          className={`${isMobile ? '' : 'mx-4 w-full'} flex items-center justify-center gap-2 rounded-full`}
          onClick={() => {
            onSelect(card)
            onClose()
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          {isSelected ? t('giftCard.selected') : t('giftCard.buyNow')}
        </Button>
      </div>
    </motion.div>
  )
}
