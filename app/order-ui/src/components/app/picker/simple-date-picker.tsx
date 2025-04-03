import * as React from 'react'
import moment from 'moment'
import { CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import {
    Button,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui'

interface ISimpleDatePickerProps {
    value?: string
    onChange: (date: string) => void
    disabledDates?: (date: Date) => boolean
}

export default function SimpleDatePicker({
    value,
    onChange,
    disabledDates,
}: ISimpleDatePickerProps) {
    const { t } = useTranslation('menu')
    const [date, setDate] = React.useState<Date | undefined>(() => {
        if (value) {
            const momentDate = moment(value, ['YYYY-MM-DD', 'DD/MM/YYYY'])
            return momentDate.isValid() ? momentDate.toDate() : new Date()
        }
        return new Date()
    })

    // Update internal date when value prop changes
    React.useEffect(() => {
        if (value) {
            const momentDate = moment(value, ['YYYY-MM-DD', 'DD/MM/YYYY'])
            if (momentDate.isValid()) {
                setDate(momentDate.toDate())
            }
        } else {
            setDate(new Date())
        }
    }, [value])

    const handleDateChange = (selectedDate?: Date) => {
        if (selectedDate) {
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
        if (date > today) return true

        // Áp dụng các điều kiện disabled khác nếu có
        if (disabledDates) return disabledDates(date)

        return false
    }

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
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? formatDisplayDate(date) : <span>{t('menu.chooseDate')}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={isDateDisabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
