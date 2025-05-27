import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useIsMobile } from '@/hooks'

interface GiftCardHeaderProps {
  sortOption: string
  onSortChange: (value: string) => void
}

export function GiftCardHeader({
  sortOption,
  onSortChange,
}: GiftCardHeaderProps) {
  const { t } = useTranslation(['giftCard'])
  const isMobile = useIsMobile()

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <motion.div initial="hidden" animate="visible" variants={fadeInVariants}>
        {/* Title section with vertical orange border on left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1.5 bg-primary"></div>
            <h1
              className={`font-bold uppercase text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}
            >
              {t('giftCard.clientPageTitle')}
            </h1>
          </div>

          {/* Sort filter */}
          <div className="flex items-center">
            <Select value={sortOption} onValueChange={onSortChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('giftCard.filterByPrice')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price,asc">
                  {t('giftCard.priceAscending')}
                </SelectItem>
                <SelectItem value="price,desc">
                  {t('giftCard.priceDescending')}
                </SelectItem>
                <SelectItem value="points,asc">
                  {t('giftCard.pointsAscending')}
                </SelectItem>
                <SelectItem value="points,desc">
                  {t('giftCard.pointsDescending')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
