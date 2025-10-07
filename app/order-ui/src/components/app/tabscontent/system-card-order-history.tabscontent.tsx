import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { usePagination, useQueryCardOrders } from '@/hooks'
import { DataTable } from '@/components/ui'
import { CardOrderStatus, SortOperation } from '@/constants'
import { SortContext } from '@/contexts'
import moment from 'moment'
import CardOrderDetailSheet from '@/components/app/sheet/card-order-detail-sheet'
import { ICardOrderResponse } from '@/types'
import CardOrderAction from '@/app/system/card-order-history/DataTable/actions/card-order-action'
import { useCardOrderColumns } from '@/app/system/card-order-history/DataTable/columns/card-order-columns'

export interface IFilterProps {
  startDate?: string;
  endDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any;
}


export function SystemCardOrderTabContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [sortField, setSortField] = useState('createdAt,desc')
  const [filter, setFilter] = useState<IFilterProps>(() => {
    return {
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      status: 'all',
    }
  })
  const [selectedRow, setSelectedRow] = useState<ICardOrderResponse | null>(null);

  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10

  const { data, isLoading, refetch } = useQueryCardOrders({
    page,
    size,
    sort: sortField,
    status: filter.status === CardOrderStatus.ALL ? null : filter.status,
    fromDate: filter?.startDate,
    toDate: filter?.endDate
  })
  const cardOrders = data?.result.items || []

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

  const handleRefresh = () => {
    handlePageChange(1)
    refetch()
  }

  const handleDateChange = useCallback((startDate: string, endDate: string) => {
    setFilter({
      ...filter,
      startDate,
      endDate
    })
  }, [setFilter, filter])

  const handleStatusChange = useCallback((v: string) => {
    setFilter(prev => (prev.status === v ? prev : { ...prev, status: v }));
  }, []);

  const renderAction = useCallback(() => (
    <CardOrderAction
      status={filter.status}
      onSelectChange={handleStatusChange}
    />
  ), [filter.status, handleStatusChange]);

  return (
    <div className="mt-4">
      <SortContext.Provider value={{ onSort: handleSortChange }}>
        <DataTable
          columns={useCardOrderColumns()}
          data={cardOrders}
          isLoading={isLoading}
          pages={data?.result.totalPages || 0}
          hiddenDatePicker={false}
          actionOptions={renderAction}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={handleRefresh}
          onDateChange={handleDateChange}
          onRowClick={(row) => {
            setSelectedRow(row)
          }}

        />
      </SortContext.Provider>
      <CardOrderDetailSheet data={selectedRow} isOpen={selectedRow ? true : false} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
