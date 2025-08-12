import { ColumnFiltersState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  DataTableFilterOptionsProps,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

interface FilterConfig {
  id: string
  label: string
  value?: string
  options: { label: string; value: string | number | boolean }[]
}
import { IUserInfo } from '@/types'

export default function DataTableFilterOptions({
  setFilterOption,
  filterConfig = [],
  onFilterChange,
}: Omit<DataTableFilterOptionsProps<IUserInfo>, 'filterConfig'> & { filterConfig?: FilterConfig[] }) {
  const { t } = useTranslation('common')
  const handleFilterChange = (filterId: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(filterId, value)
    }

    const filterConditions: ColumnFiltersState = filterConfig
      .map(filter => ({
        id: filter.id,
        value: filter.id === filterId ? value : (filter.value || 'all')
      }))
      .filter(({ value }) => value !== 'all')

    setFilterOption(filterConditions)
  }

  if (!filterConfig?.length) return null

  return (
    <div className="flex gap-2">
      {filterConfig.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value || 'all'}
          onValueChange={(value) => handleFilterChange(filter.id, value)}
        >
          <SelectTrigger className="text-xs w-fit">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectGroup>
              <SelectLabel className="text-xs">{t('common.action')}</SelectLabel>
              {filter.options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
