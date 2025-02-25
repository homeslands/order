import { useState } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  DataTableFilterOptionsProps,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { IMenu } from '@/types'

export default function DataTableFilterOptions({
  setFilterOption,
}: DataTableFilterOptionsProps<IMenu>) {
  const { t } = useTranslation('common')
  const [filterValue, setFilterValue] = useState<string>('all')

  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    let filterConditions: ColumnFiltersState = [];

    switch (value) {
      case 'all': // Hiển thị tất cả
        filterConditions = [];
        break;
      case 'true': // Lọc những bản ghi có isTemplate = true
        filterConditions = [
          {
            id: 'isTemplate',
            value: true,
          },
        ];
        break;
      case 'false': // Lọc những bản ghi có isTemplate = false
        filterConditions = [
          {
            id: 'isTemplate',
            value: false,
          },
        ];
        break;
      default:
        filterConditions = [];
    }

    setFilterOption(filterConditions);
  };


  return (
    <Select value={filterValue} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[12rem]">
        <SelectValue placeholder={t('dataTable.filter')} />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectItem value="all">{t('dataTable.all')}</SelectItem>
        <>
          <SelectItem value="true">{t('dataTable.isTemplate')}</SelectItem>
          <SelectItem value="false">{t('dataTable.noTemplate')}</SelectItem>
        </>
      </SelectContent>
    </Select>
  )
}
