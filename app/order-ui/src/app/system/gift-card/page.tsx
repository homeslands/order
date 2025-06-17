import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Gift } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { useGetGiftCards, usePagination } from '@/hooks'
import { DataTable } from '@/components/ui'
import { useGiftCardListColumns } from './DataTable/columns'
import { GiftCardAction } from './DataTable/actions'
import { SortOperation } from '@/constants'
import { SortContext } from '@/contexts'

export default function GiftCardPage() {
  const { t } = useTranslation(['giftCard'])
  const { t: tHelmet } = useTranslation('helmet')
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const [sortField, setSortField] = useState('createdAt,desc')
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()

  // add page size to query params
  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('page', pagination.pageIndex.toString())
      prev.set('size', pagination.pageSize.toString())
      return prev
    })
  }, [pagination.pageIndex, pagination.pageSize, setSearchParams])

  const handleSortChange = (operation: SortOperation) => {
    // Sort field updated based on operation type
    if (operation === SortOperation.CREATE) {
      setSortField('createdAt,desc')
    } else if (operation === SortOperation.UPDATE) {
      setSortField('updatedAt,desc')
    }
  }

  const { data: giftCardData, isLoading } = useGetGiftCards({
    page,
    size,
    sort: sortField,
    isActive: null,
  })

  const giftCards = giftCardData?.result.items || []
  return (
    <div className="grid h-full grid-cols-1 gap-2">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.giftCard.title')}</title>
        <meta name="description" content={tHelmet('helmet.giftCard.title')} />
      </Helmet>
      <span className="flex items-center justify-between gap-1 pt-1 text-lg text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Gift className="text-gray-700 dark:text-gray-300" />
          {t('giftCard.pageTitle')}
        </div>
      </span>
      <div className="mt-4">
        <SortContext.Provider value={{ onSort: handleSortChange }}>
          <DataTable
            columns={useGiftCardListColumns()}
            data={giftCards}
            isLoading={isLoading}
            pages={giftCardData?.result.totalPages || 0}
            actionOptions={GiftCardAction}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </SortContext.Provider>
      </div>
    </div>
  )
}
