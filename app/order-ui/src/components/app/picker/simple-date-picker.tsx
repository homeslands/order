import * as React from 'react'
import moment from 'moment'
import { CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { vi } from 'date-fns/locale'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import {
    Button,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui'

interface ISimpleDatePickerProps {
    value?: string
    onChange: (date: string) => void
    disabledDates?: (date: Date) => boolean
    disableFutureDates?: boolean
    minDate?: string 
    maxDate?: string
    allowEmpty?: boolean
}

// Utility to generate an array of years
const generateYears = (start: number, end: number) => {
    const years = []
    for (let i = end; i >= start; i--) {
        years.push(i)
    }
    return years
}

export default function SimpleDatePicker({
    value,
    onChange,
    disabledDates,
    disableFutureDates,
    minDate,
    maxDate,
    allowEmpty = false,
}: ISimpleDatePickerProps) {
    const { t } = useTranslation('menu')
    const [month, setMonth] = React.useState<number>(value ? new Date(value.split('/').reverse().join('-')).getMonth() : new Date().getMonth())
    const [year, setYear] = React.useState<number>(value ? new Date(value.split('/').reverse().join('-')).getFullYear() : new Date().getFullYear())
    const years = generateYears(1920, new Date().getFullYear()) // 100 years range
    const [date, setDate] = React.useState<Date | undefined>(() => {
        if (value) {
            const momentDate = moment(value, ['YYYY-MM-DD', 'DD/MM/YYYY'])
            return momentDate.isValid() ? momentDate.toDate() : new Date()
        }
        return allowEmpty ? undefined : new Date()
    })

    // Update internal date when value prop changes
    React.useEffect(() => {
        if (value) {
            const momentDate = moment(value, ['YYYY-MM-DD', 'DD/MM/YYYY'])
            if (momentDate.isValid()) {
                setDate(momentDate.toDate())
            }
        } else {
            setDate(allowEmpty ? undefined : new Date())
        }
    }, [value, allowEmpty])

    const handleDateChange = (selectedDate?: Date) => {
        if (selectedDate) {
            // if (!validateEndDate(selectedDate)) {
            //     alert(t('common.endDateMustBeGreaterThanStartDate'))
            //     return
            // }
            setDate(selectedDate)
            // Format date as YYYY-MM-DD for consistency
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD')
            onChange(formattedDate)
        }
    }

    const formatDisplayDate = (date?: Date) => {
        if (!date) return ''
        return moment(date).format('DD/MM/YYYY')
    }

    const isDateDisabled = (date: Date) => {
        // Không cho phép chọn ngày sau ngày hiện tại
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (disableFutureDates && date > today) return true

        if (minDate) {
            const minDateObj = moment(minDate, 'YYYY-MM-DD').toDate()
            minDateObj.setHours(0, 0, 0, 0)
            if (date < minDateObj) return true
        }

        if (maxDate) {
            const maxDateObj = moment(maxDate, 'YYYY-MM-DD').toDate()
            maxDateObj.setHours(0, 0, 0, 0)
            if (date > maxDateObj) return true
        }

        // Áp dụng các điều kiện disabled khác nếu có
        if (disabledDates) return disabledDates(date)

        return false
    }

    // const validateEndDate = (endDate: Date) => {
    //     if (date && endDate) {
    //         return endDate > date
    //     }
    //     return false
    // }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {date ? formatDisplayDate(date) : <span>{t('menu.chooseDate')}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto">
                {/* Month and Year Selection */}
                <div className="flex justify-between items-center mb-4 space-x-2">
                    <Select
                        value={String(month)}
                        onValueChange={(value) => setMonth(Number(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('common.month')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>
                                    {format(new Date(0, i), 'MMMM', { locale: vi }).charAt(0).toUpperCase() + format(new Date(0, i), 'MMMM', { locale: vi }).slice(1)} {/* Tháng bằng tiếng Việt, chữ cái đầu tiên in hoa */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(year)}
                        onValueChange={(value) => setYear(Number(value))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('common.year')} />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={isDateDisabled}
                    initialFocus
                    month={new Date(year, month)}
                    onMonthChange={(newMonthDate) => {
                        setMonth(newMonthDate.getMonth())
                        setYear(newMonthDate.getFullYear())
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}
