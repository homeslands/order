import { motion } from 'framer-motion'
import { CoinsIcon, Gift } from 'lucide-react'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'
import { IGiftCard } from '@/types'
import { useIsMobile } from '@/hooks'
import { GiftCardSelectedDialog } from '@/components/app/dialog'
import { GiftCardSelectedDrawer } from '@/components/app/drawer'
import { Tooltip } from 'react-tooltip'

interface GiftCardItemProps {
  card: IGiftCard
  index: number
  isSelected: boolean
  onSelect: (card: IGiftCard) => void
  onClose: () => void
}

export default function GiftCardItem({ card, index }: GiftCardItemProps) {
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
    <>
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
      >
        {/* Card Image */}
        <div
          className={`relative flex items-center justify-center overflow-hidden ${
            isMobile ? 'h-full w-32 flex-shrink-0 px-2 py-4' : 'h-48 w-full'
          }`}
        >
          {card.image ? (
            <img
              src={`${publicFileURL}/${card.image}`}
              alt={card.title}
              className={`${isMobile ? 'h-max w-full rounded-md bg-gray-300 object-contain' : 'h-full w-full object-cover'}`}
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
          className={`${isMobile ? 'flex flex-1 flex-col justify-between p-2' : 'p-3'}`}
        >
          <div>
            <h3
              className={`${isMobile ? 'line-clamp-1 text-sm font-bold' : 'mb-2 truncate text-xl font-bold'} text-gray-900 dark:text-white`}
              data-tooltip-id="title-tooltip"
              data-tooltip-content={String(card.title)}
            >
              {card.title}
            </h3>{' '}
            {!isMobile && card.description ? (
              <p className="mb-4 line-clamp-2 h-10 overflow-hidden text-ellipsis text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <span
                    data-tooltip-id="description-tooltip"
                    data-tooltip-content={String(card.description)}
                  >
                    {card.description}
                  </span>
                  <span>&nbsp;</span>
                </div>
              </p>
            ) : !isMobile ? (
              <p className="mb-4 flex h-10 flex-col justify-between text-sm text-gray-400"></p>
            ) : null}
          </div>

          {/* Price */}
          <div
            className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}
          >
            <div
              className={`flex items-center gap-1 ${isMobile ? 'mb-1' : ''}`}
            >
              <CoinsIcon className="h-5 w-5 text-yellow-500" />
              <span
                className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-primary`}
              >
                {formatCurrency(card.points, '')}
              </span>
            </div>
            <div
              className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-primary`}
            >
              {formatCurrency(card.price)}
            </div>
          </div>
        </div>{' '}
        <div
          className={`flex justify-center ${isMobile ? 'items-end p-2' : 'pb-6'}`}
        >
          {isMobile ? (
            <GiftCardSelectedDrawer selectedCard={card} />
          ) : (
            <GiftCardSelectedDialog selectedCard={card} />
          )}
        </div>
      </motion.div>
      <Tooltip
        id="description-tooltip"
        variant="light"
        style={{ width: '30rem' }}
      />
      <Tooltip id="title-tooltip" variant="light" style={{ width: '30rem' }} />
    </>
  )
}
