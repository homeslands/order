// Removed unused React import
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'

interface GiftCardPaginationProps {
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function GiftCardPagination({
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: GiftCardPaginationProps) {
  const { t } = useTranslation('common')

  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between border-t border-gray-200 px-2 py-4">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t('dataTable.rowsPerPage')}</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[8, 16, 32, 48, 64].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('dataTable.page')} {currentPage} {t('dataTable.of')} {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              onPageChange(1)
            }}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">{t('dataTable.goToFirstPage')}</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              onPageChange(currentPage - 1)
            }}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">{t('dataTable.goToPreviousPage')}</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              onPageChange(currentPage + 1)
            }}
            disabled={!canNextPage}
          >
            <span className="sr-only">{t('dataTable.goToNextPage')}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              onPageChange(totalPages)
            }}
            disabled={!canNextPage}
          >
            <span className="sr-only">{t('dataTable.goToLastPage')}</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
