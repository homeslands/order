import { useTranslation } from 'react-i18next'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
  useReactTable,
  Column,
  Table as ReactTable,
} from '@tanstack/react-table'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  MoveRight,
  RefreshCcw,
  SearchIcon,
} from 'lucide-react'
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import moment from 'moment'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Input,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDebouncedInput } from '@/hooks'
import { SimpleDatePicker } from '../app/picker'
import { PeriodOfTimeSelect } from '../app/select'

interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export interface DataTableFilterOptionsProps<TData> {
  setFilterOption: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  data: TData[]
  filterConfig?: {
    id: string
    label: string
    options: {
      label: string
      value: string | number | boolean
    }[]
  }[]
  onFilterChange?: (filterId: string, value: string) => void
}

// DataTableColumnHeader Component
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export interface DataTableActionOptionsProps<TData> {
  table: ReactTable<TData>
}

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>
}

// DataTable Component
interface DataTableProps<TData, TValue> {
  isLoading: boolean
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pages: number
  hiddenInput?: boolean
  hiddenDatePicker?: boolean
  onRefresh?: () => void
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRowClick?: (row: TData) => void
  onInputChange?: (value: string) => void
  periodOfTime?: string
  onDateChange?: (startDate: string | null, endDate: string | null) => void
  filterOptions?: React.FC<DataTableFilterOptionsProps<TData>>
  actionOptions?: React.FC<DataTableActionOptionsProps<TData>>
  rowClassName?: (row: TData) => string
  filterConfig?: {
    id: string
    label: string
    options: {
      label: string
      value: string | number | boolean
    }[]
  }[]
  onFilterChange?: (filterId: string, value: string) => void
}

export function DataTable<TData, TValue>({
  isLoading,
  columns,
  data,
  pages,
  hiddenInput = true,
  hiddenDatePicker = true,
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onInputChange,
  periodOfTime,
  onDateChange,
  filterOptions: DataTableFilterOptions,
  actionOptions: DataTableActionOptions,
  rowClassName,
  filterConfig,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('common')
  const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  today.setHours(0, 0, 0, 0)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  // Add effect to call onInputChange when debounced value changes
  useEffect(() => {
    if (onInputChange) {
      onInputChange(debouncedInputValue)
    }
  }, [debouncedInputValue, onInputChange])

  // Add effect to call onDateChange when dates change
  useEffect(() => {
    if (onDateChange) {
      onDateChange(startDate, endDate)
    }
  }, [startDate, endDate, onDateChange])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    pageCount: pages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    debugTable: true,
  })

  const handlePeriodOfTimeChange = useCallback((periodOfTime: string) => {
    if (periodOfTime === 'today') {
      setStartDate(moment(today).format('YYYY-MM-DD'))
      setEndDate(moment(today).format('YYYY-MM-DD'))
    } else if (periodOfTime === 'inWeek') {
      setStartDate(moment(today).subtract(1, 'week').format('YYYY-MM-DD'))
      setEndDate(moment(today).format('YYYY-MM-DD'))
    } else if (periodOfTime === 'inMonth') {
      setStartDate(moment(today).subtract(1, 'month').format('YYYY-MM-DD'))
      setEndDate(moment(today).format('YYYY-MM-DD'))
    } else if (periodOfTime === 'inYear') {
      setStartDate(moment(today).subtract(1, 'year').format('YYYY-MM-DD'))
      setEndDate(moment(today).format('YYYY-MM-DD'))
    }
  }, [today])

  const handleRefresh = () => {
    onRefresh?.()
  }

  return (
    <div className="w-full">
      <div
        className={`flex ${!hiddenInput || !hiddenDatePicker ? 'justify-between' : 'justify-between'} items-end flex-wrap gap-2`}
      >
        <div className="flex gap-2 justify-start items-start">
          {/* Input search */}
          {!hiddenInput && (
            <div className="relative w-[350px]">
              <SearchIcon className="absolute left-2 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder={t('dataTable.search')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-8 text-sm border placeholder:hidden sm:w-full sm:pr-2 placeholder:sm:inline md:w-full"
              />
            </div>
          )}
          {!hiddenDatePicker && (
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2 items-center w-fit">
                <div className="flex-1">
                  <SimpleDatePicker
                    value={startDate || undefined}
                    onChange={setStartDate}
                    disabledDates={endDate ? (date: Date) => {
                      const endDateObj = new Date(endDate.split('/').reverse().join('-'))
                      return date > endDateObj
                    } : undefined}
                  />
                </div>
                <MoveRight className="icon" />
                <div className="flex-1">
                  <SimpleDatePicker
                    value={endDate || undefined}
                    onChange={setEndDate}
                    disabledDates={startDate ? (date: Date) => {
                      const startDateObj = new Date(startDate.split('/').reverse().join('-'))
                      return date < startDateObj
                    } : undefined}
                  />
                </div>
              </div>
              <PeriodOfTimeSelect periodOfTime={periodOfTime} onChange={handlePeriodOfTimeChange} />
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center w-fit">
          {onRefresh && (
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcw className="w-4 h-4 text-muted-foreground" />
              <span className='text-muted-foreground'>
                {t('dataTable.refresh')}
              </span>
            </Button>
          )}
          {/* Actions */}
          {DataTableActionOptions && <DataTableActionOptions table={table} />}
          {/* Filter */}
          {DataTableFilterOptions && (
            <DataTableFilterOptions
              setFilterOption={setColumnFilters}
              data={data}
              filterConfig={filterConfig}
              onFilterChange={onFilterChange}
            />
          )}
          {/* View options */}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 rounded-md border">
        <Table>
          <TableHeader className="bg-muted-foreground/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="mx-auto w-full h-full text-center"
                >
                  <Loader2Icon className="mx-auto w-6 h-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() ? t('tablePaging.selected') : undefined
                  }
                  className={cn(
                    'relative cursor-pointer hover:bg-primary/20',
                    index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted-foreground/15',
                    rowClassName ? rowClassName(row.original) : ''
                  )}

                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-full text-center"
                >
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center py-4 space-x-2">
        <DataTablePagination
          table={table}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation(['common'])

  if (!column.getCanSort()) {
    return <div className="text-[0.7rem]">{title}</div>
  }

  return (
    <div
      className={cn(
        'flex min-w-[6rem] items-center space-x-2 text-[0.7rem]',
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="text-[0.8rem]">{t(title)}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3 h-3" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.asc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.desc')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.hide')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function DataTableColumnAddressHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation(['common'])
  if (!column.getCanSort()) {
    return <div className="text-[0.8rem]">{title}</div>
  }

  return (
    <div
      className={cn(
        'flex min-w-[12rem] items-center space-x-2 text-[0.8rem]',
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="text-[0.8rem]">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3 h-3" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.asc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.desc')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.hide')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function DataTableColumnActionHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation(['common'])
  if (!column.getCanSort()) {
    return <div className="text-[0.8rem]">{title}</div>
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-2 text-[0.8rem]',
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="text-[0.8rem]">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3 h-3" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3 h-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.asc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.desc')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <ArrowUpIcon className="mr-2 w-3 h-3 text-muted-foreground/70" />
            {t('dataTable.hide')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-wrap justify-between items-center px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium sr-only">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
              onPageSizeChange?.(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sr-only flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden p-0 w-8 h-8 lg:flex"
            onClick={() => {
              table.setPageIndex(0)
              onPageChange?.(1)
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="p-0 w-8 h-8"
            onClick={() => {
              onPageChange(table.getState().pagination.pageIndex)
              table.previousPage()
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="p-0 w-8 h-8"
            onClick={() => {
              onPageChange(table.getState().pagination.pageIndex + 2)
              table.nextPage()
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden p-0 w-8 h-8 lg:flex"
            onClick={() => {
              onPageChange(table.getPageCount())
              table.setPageIndex(table.getPageCount() - 1)
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 items-center h-10 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 w-4 h-4" />
          Hiển thị
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Hiện thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
