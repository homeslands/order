import { useState } from 'react'
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
import { IOrder } from '@/types'

export default function DataTableFilterOptions({
    setFilterOption,
    filterConfig,
    onFilterChange,
}: DataTableFilterOptionsProps<IOrder>) {
    const { t } = useTranslation('common')
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})

    const handleFilterChange = (filterId: string, value: string) => {
        setFilterValues(prev => ({
            ...prev,
            [filterId]: value
        }))

        if (onFilterChange) {
            onFilterChange(filterId, value)
        }

        const filterConditions: ColumnFiltersState = Object.entries({
            ...filterValues,
            [filterId]: value
        })
            .filter(([_, value]) => value !== 'all')
            .map(([id, value]) => ({
                id,
                value,
            }))

        setFilterOption(filterConditions)
    }

    if (!filterConfig?.length) return null
    return (
        <div className="flex gap-2">
            {filterConfig.map((filter) => (
                <Select
                    key={filter.id}
                    value={filterValues[filter.id] || 'all'}
                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                >
                    <SelectTrigger className="h-10 text-xs w-fit">
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        <SelectGroup>
                            <SelectLabel className="text-xs">{t('dataTable.filter')}</SelectLabel>
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