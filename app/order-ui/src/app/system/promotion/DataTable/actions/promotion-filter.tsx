import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Role } from '@/constants'
import {
  DataTableFilterOptionsProps,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { IUserInfo } from '@/types'

export default function DataTableFilterOptions({
  setFilterOption,
}: DataTableFilterOptionsProps<IUserInfo>) {
  const { t } = useTranslation('common')
  const { t: tEmployee } = useTranslation('voucher')
  const [filterValue, setFilterValue] = useState<string>('all')

  const handleFilterChange = (value: string) => {
    setFilterValue(value)

    let filterConditions: ColumnFiltersState = []

    if (value !== 'all') {
      filterConditions = [
        {
          id: 'role',
          value: value,
        },
      ]
    }
    setFilterOption(filterConditions)
  }

  return (
    <Select value={filterValue} onValueChange={handleFilterChange}>
      <SelectTrigger className="text-xs w-fit">
        <SelectValue placeholder={t('dataTable.filter')} />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectItem value="all">{t('dataTable.all')}</SelectItem>
        <SelectItem value={`${Role.ADMIN}`} className="text-xs">
          {tEmployee('voucher.ADMIN')}
        </SelectItem>
        <SelectItem value={`${Role.MANAGER}`} className="text-xs">
          {tEmployee('voucher.MANAGER')}
        </SelectItem>
        <SelectItem value={`${Role.STAFF}`} className="text-xs">
          {tEmployee('voucher.STAFF')}
        </SelectItem>
        <SelectItem value={`${Role.CHEF}`} className="text-xs">
          {tEmployee('voucher.CHEF')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
