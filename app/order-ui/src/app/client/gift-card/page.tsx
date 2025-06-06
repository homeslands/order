import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Gift } from 'lucide-react'
import { motion } from 'framer-motion'

import { useGetGiftCards } from '@/hooks'
import {
  GiftCardSheet,
  GiftCardItem,
  GiftCardPagination,
  GiftCardHeader,
} from './components'
import { SkeletonMenuList } from '@/components/app/skeleton'

export default function ClientGiftCardPage() {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tHelmet } = useTranslation('helmet')
  const [sortOption, setSortOption] = useState<string>('price,asc')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(8)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }
  const { data: giftCardData, isLoading } = useGetGiftCards({
    page: currentPage,
    size: pageSize,
    isActive: true,
    sort: sortOption,
  })

  const giftCards = giftCardData?.result.items || []
  const totalPages = giftCardData?.result.totalPages || 1
  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <SkeletonMenuList key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.giftCard.title')}</title>
        <meta
          name="description"
          content={tHelmet('helmet.giftCard.description')}
        />{' '}
      </Helmet>
      <GiftCardHeader sortOption={sortOption} onSortChange={setSortOption} />
      {/* Gift Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {giftCards.map((card, index) => (
          <GiftCardItem key={card.slug} card={card} index={index} />
        ))}
      </motion.div>{' '}
      {/* Empty State */}
      {giftCards.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          className="py-20 text-center"
        >
          <Gift className="mx-auto mb-6 h-24 w-24 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-500">
            {t('giftCard.noGiftCardsAvailable')}
          </h3>
        </motion.div>
      )}{' '}
      {/* Pagination component từ DataTable */}
      {giftCards.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <GiftCardPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </motion.div>
      )}
      <GiftCardSheet />
    </div>
  )
}
