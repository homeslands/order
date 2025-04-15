import * as React from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format, isToday, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale' // Thêm locale tiếng Việt
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

// Utility to generate an array of years
const generateYears = (start: number, end: number) => {
  const years = []
  for (let i = end; i >= start; i--) {
    years.push(i)
  }
  return years
}

interface DatePickerProps {
  date: string | null
  onSelect: (date: string | null) => void
  validateDate?: (date: Date) => boolean
  disabled?: boolean
  today?: boolean
  disabledDates?: Date[]
}

export default function DatePicker({
  date,
  onSelect,
  validateDate,
  disabled,
  today,
  disabledDates = [],
}: DatePickerProps) {
  const { t } = useTranslation(['common'])
  const [month, setMonth] = React.useState<number>(date ? new Date(date.split('/').reverse().join('-')).getMonth() : new Date().getMonth())
  const [year, setYear] = React.useState<number>(date ? new Date(date.split('/').reverse().join('-')).getFullYear() : new Date().getFullYear())
  const years = generateYears(1920, new Date().getFullYear()) // 100 years range

  const parsedDate = React.useMemo(() => {
    return date ? new Date(date.split('/').reverse().join('-')) : undefined
  }, [date])

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (selectedDate && validateDate && validateDate(selectedDate)) {
      // Chọn ngày và hiển thị theo định dạng 'dd/MM/yyyy'
      onSelect(format(selectedDate, 'dd/MM/yyyy'))
    } else {
      onSelect(null)
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    if (validateDate && validateDate(today)) {
      onSelect(format(today, 'dd/MM/yyyy'))
    }
  }

  const isDateDisabled = (date: Date) => {
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 w-4 h-4" />
          {date ? (
            // Hiển thị ngày theo định dạng 'dd/MM/yyyy' khi đã chọn
            format(new Date(date.split('/').reverse().join('-')), 'dd/MM/yyyy')
          ) : (
            <span>
              {t('common.selectDate')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-auto" align="start">
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

        {/* Today Button */}
        {today && (
          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={handleTodayClick}
          >
            {t('common.today')}
          </Button>
        )}

        {/* Calendar */}
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelectDate}
          month={new Date(year, month)}
          initialFocus
          locale={vi} // Chuyển đổi lịch sang tiếng Việt
          disabled={isDateDisabled}
          modifiers={{
            today: (date) => isToday(date),
          }}
          modifiersStyles={{
            today: {
              fontWeight: 'bold',
              color: 'var(--primary)',
            },
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
