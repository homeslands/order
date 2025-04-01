import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetChefOrders, usePagination } from '@/hooks'
import { IChefOrders, IGetChefOrderRequest } from '@/types'
import { DataTable } from '@/components/ui'
import { usePendingChefOrdersColumns } from './DataTable/columns'
import { ChefOrderItemDetailSheet } from '@/components/app/sheet'
import { ChefOrderActionOptions } from './DataTable/actions'
import { useSearchParams } from 'react-router-dom'

export default function ChefOrderPage() {
  const { t } = useTranslation(['chefArea'])
  const { t: tHelmet } = useTranslation('helmet')
  const [chefOrderSlug, setChefOrderSlug] = useState<string>('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<IChefOrders>()
  const [enableFetch, setEnableFetch] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [slug, setSlug] = useState(searchParams.get('slug') || selectedRow)

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (slug === '') {
        newParams.delete('slug')
        newParams.set('slug', selectedRow?.slug || '')
      }
      return newParams
    })

    setIsSheetOpen(slug !== '')

  }, [slug, setSearchParams, setIsSheetOpen, selectedRow])

  const { handlePageChange, handlePageSizeChange } = usePagination()
  const [selectedChefOrderStatus, setSelectedChefOrderStatus] = useState<string>('all')
  const handleCloseSheet = () => {
    setIsSheetOpen(false)
  }

  const chefOrderParams: IGetChefOrderRequest = {
    chefArea: chefOrderSlug,
    ...(selectedChefOrderStatus !== 'all' && { status: selectedChefOrderStatus })
  }

  const {
    data: chefOrders,
    isLoading,
    refetch,
  } = useGetChefOrders(chefOrderParams)
  //polling useOrders every 5 seconds
  useEffect(() => {
    if (!chefOrders) return
    const interval = setInterval(async () => {
      try {
        await refetch()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 5000) // Polling every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [chefOrders, refetch])

  const handleSelect = (slug: string) => {
    setChefOrderSlug(slug)
  }

  const handleChefOrderClick = (chefOrder: IChefOrders) => {
    setSelectedRow(chefOrder)
    setSlug(chefOrder.slug)
    setEnableFetch(true)
    setIsSheetOpen(true)
  }
  const handleSelectStatus = (status: string) => {
    setSelectedChefOrderStatus(status)
  }

  return (
    <div className="flex flex-col flex-1 gap-2">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.orderManagement.title')}</title>
        <meta
          name="description"
          content={tHelmet('helmet.orderManagement.title')}
        />
      </Helmet>
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('chefOrder.title')}
      </span>
      <div className="grid grid-cols-1 gap-2 h-full">
        <DataTable
          isLoading={isLoading}
          data={chefOrders?.result || []}
          columns={usePendingChefOrdersColumns()}
          pages={1}
          actionOptions={ChefOrderActionOptions({ onSelect: handleSelect, onSelectStatus: handleSelectStatus })}
          onRowClick={handleChefOrderClick}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowClassName={(row) =>
            row.slug === selectedRow?.slug
              ? 'bg-primary/20 border border-primary'
              : ''
          }
        />
        <ChefOrderItemDetailSheet
          chefOrder={selectedRow}
          enableFetch={enableFetch}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      </div>
    </div>
  )
}
