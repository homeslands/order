import { useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Role } from '@/constants';

import {
    DataTableFilterOptionsProps,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { IUserInfo } from '@/types';

export default function DataTableFilterOptions({
    setFilterOption,
}: DataTableFilterOptionsProps<IUserInfo>) {
    const { t } = useTranslation('common');
    const { t: tEmployee } = useTranslation('employee');
    const [filterValue, setFilterValue] = useState<string>('all');

    const handleFilterChange = (value: string) => {
        setFilterValue(value);

        let filterConditions: ColumnFiltersState = [];
        console.log(value, filterValue);

        if (value !== 'all') {
            filterConditions = [
                {
                    id: 'role',
                    value: value,
                },
            ];
        }
        setFilterOption(filterConditions);
        console.log(filterConditions);
    };

    return (
        <Select value={filterValue} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[12rem] h-10">
                <SelectValue placeholder={t('dataTable.filter')} />
            </SelectTrigger>
            <SelectContent side="top">
                <SelectItem value="all">{t('dataTable.all')}</SelectItem>
                <SelectItem value={`${Role.ADMIN}`}>{tEmployee('employee.ADMIN')}</SelectItem>
                <SelectItem value={`${Role.MANAGER}`}>{tEmployee('employee.MANAGER')}</SelectItem>
                <SelectItem value={`${Role.STAFF}`}>{tEmployee('employee.STAFF')}</SelectItem>
                <SelectItem value={`${Role.CHEF}`}>{tEmployee('employee.CHEF')}</SelectItem>
            </SelectContent>
        </Select>
    );
}
