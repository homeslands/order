import * as React from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format, isToday, isSameDay, parse } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
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

// Helper: parse date from "dd/MM/yyyy" string safely
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null

  // Ưu tiên parse định dạng dd/MM/yyyy
  const parsedLocal = parse(dateString.trim(), 'dd/MM/yyyy', new Date())
  if (!isNaN(parsedLocal.getTime())) return parsedLocal

  // Nếu không parse được, thử ISO string
  const parsedISO = new Date(dateString)
  return isNaN(parsedISO.getTime()) ? null : parsedISO
}

// Helper: format date to "dd/MM/yyyy"
const formatDateString = (date: Date): string => format(date, 'dd/MM/yyyy')

interface DatePickerProps {
  backgroundColor?: string
  date: string | null
  onSelect: (date: string | null) => void
  validateDate?: (date: Date) => boolean
  disabled?: boolean
  today?: boolean
  disabledDates?: Date[]
  disableFutureDate?: boolean
}

export default function DatePicker({
  backgroundColor,
  date,
  onSelect,
  validateDate,
  disabled,
  today,
  disabledDates = [],
  disableFutureDate = false,
}: DatePickerProps) {
  const { t, i18n } = useTranslation(['common'])
  const locale = React.useMemo(() => {
    return i18n.language === 'en' ? enUS : vi
  }, [i18n.language])

  const parsedDate = React.useMemo(() => {
    return date ? parseDateString(date) : undefined
  }, [date])

  const [month, setMonth] = React.useState<number>(parsedDate?.getMonth() ?? new Date().getMonth())
  const [year, setYear] = React.useState<number>(parsedDate?.getFullYear() ?? new Date().getFullYear())
  const years = generateYears(1920, new Date().getFullYear())

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return onSelect(null)

    const valid = !isNaN(selectedDate.getTime()) &&
      (!validateDate || validateDate(selectedDate))

    if (valid) {
      onSelect(formatDateString(selectedDate))
    } else {
      onSelect(null)
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    if (!validateDate || validateDate(today)) {
      onSelect(formatDateString(today))
    }
  }

  const isDateDisabled = (date: Date) => {
    const isInDisabledList = disabledDates.some(d => isSameDay(date, d))
    const isFuture = disableFutureDate && date > new Date()
    return isInDisabledList || isFuture
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            `w-full justify-start text-left font-normal ${backgroundColor}`,
            !date && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 w-4 h-4" />
          {parsedDate ? formatDateString(parsedDate) : <span>{t('common.selectDate')}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-4 w-auto" align="start">
        {/* Month + Year select */}
        <div className="flex justify-between items-center mb-4 space-x-2">
          <Select
            value={String(month)}
            onValueChange={(value) => setMonth(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('common.month')} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const monthName = format(new Date(0, i), 'MMMM', { locale })
                return (
                  <SelectItem key={i} value={String(i)}>
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                  </SelectItem>
                )
              })}
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
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Today shortcut */}
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
          selected={parsedDate || undefined}
          onSelect={handleSelectDate}
          month={new Date(year, month)}
          onMonthChange={(newMonth) => {
            setMonth(newMonth.getMonth())
            setYear(newMonth.getFullYear())
          }}
          initialFocus
          locale={locale}
          disabled={isDateDisabled}
          modifiers={{
            today: (d) => isToday(d),
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
