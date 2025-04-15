import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useDebouncedInput, useGetChefOrders, usePagination } from '@/hooks'
import { IChefOrders, IGetChefOrderRequest } from '@/types'
import { DataTable } from '@/components/ui'
import { usePendingChefOrdersColumns } from './DataTable/columns'
import { ChefOrderItemDetailSheet } from '@/components/app/sheet'
import { ChefOrderActionOptions } from './DataTable/actions'
import { useSelectedChefOrderStore } from '@/stores'
import moment from 'moment'

export default function ChefOrderPage() {
  const { t } = useTranslation(['chefArea'])
  const { t: tHelmet } = useTranslation('helmet')
  const { isSheetOpen, setIsSheetOpen, selectedRow, setSelectedRow, chefOrderStatus, chefOrderByChefAreaSlug, chefOrder, setChefOrder } = useSelectedChefOrderStore()
  const { setInputValue, debouncedInputValue } = useDebouncedInput()
  const { pagination, setPagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [startDate, setStartDate] = useState<string>(moment().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'))

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
  }
  const chefOrderParams: IGetChefOrderRequest = {
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: debouncedInputValue || undefined,
    ...(debouncedInputValue ? {} :
      {
        chefArea: chefOrderByChefAreaSlug,
        startDate: startDate,
        endDate: endDate,
        ...(chefOrderStatus !== 'all' && { status: chefOrderStatus })
      }
    )
  }

  const {
    data: chefOrders,
    isLoading,
    refetch,
  } = useGetChefOrders(chefOrderParams)

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 1
    }))
  }, [debouncedInputValue, chefOrderStatus, chefOrderByChefAreaSlug, startDate, endDate, setPagination])

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
    }, 3000) // Polling every 3 seconds

    return () => clearInterval(interval) // Cleanup
  }, [chefOrders, refetch])

  const handleChefOrderClick = (chefOrder: IChefOrders) => {
    setSelectedRow(chefOrder.slug)
    setChefOrder(chefOrder)
    setIsSheetOpen(true)
  }

  const handleUpdateChefOrderStatusSuccess = () => {
    refetch()
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
          data={chefOrders?.items || []}
          columns={usePendingChefOrdersColumns()}
          pages={chefOrders?.totalPages || 1}
          actionOptions={ChefOrderActionOptions()}
          hiddenInput={false}
          hiddenDatePicker={false}
          onInputChange={setInputValue}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          onRowClick={handleChefOrderClick}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowClassName={(row) =>
            row.slug === selectedRow
              ? 'bg-primary/20 border border-primary'
              : ''
          }
        />
        <ChefOrderItemDetailSheet
          onSuccess={handleUpdateChefOrderStatusSuccess}
          chefOrder={chefOrder}
          enableFetch={true}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      </div>
    </div>
  )
}
