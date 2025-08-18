import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, isToday, isSameDay, parse } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

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

// Utility to generate an array of years
const generateYears = (start: number, end: number) => {
  const years = []
  for (let i = end; i >= start; i--) {
    years.push(i)
  }
  return years
}

// Helper: parse date from string safely
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null

  // Try parsing different formats
  const formats = ['dd/MM/yyyy HH:mm:ss', 'dd/MM/yyyy HH:mm', 'dd/MM/yyyy', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd']

  for (const format of formats) {
    const parsedDate = parse(dateString.trim(), format, new Date())
    if (!isNaN(parsedDate.getTime())) return parsedDate
  }

  // Fallback to ISO string
  const parsedISO = new Date(dateString)
  return isNaN(parsedISO.getTime()) ? null : parsedISO
}

// Helper: format date to display string
const formatDateString = (date: Date, showTime: boolean): string => {
  return showTime ? format(date, 'dd/MM/yyyy HH:mm') : format(date, 'dd/MM/yyyy')
}

// Helper: format date to value string
const formatValueString = (date: Date, showTime: boolean): string => {
  return showTime ? format(date, 'yyyy-MM-dd HH:mm:ss') : format(date, 'yyyy-MM-dd')
}

interface DatePickerProps {
  date: string | null
  onSelect: (date: string | null) => void
  validateDate?: (date: Date) => boolean
  disabled?: boolean
  today?: boolean
  disabledDates?: Date[]
  showTime?: boolean
  disableFutureDate?: boolean
}

export default function DateAndTimePicker({
  date,
  onSelect,
  validateDate,
  disabled,
  today,
  disabledDates = [],
  showTime = false,
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

  const [hour, setHour] = React.useState<number>(() => {
    return parsedDate?.getHours() ?? 0
  })
  const [minute, setMinute] = React.useState<number>(() => {
    return parsedDate?.getMinutes() ?? 0
  })

  // Update hour and minute when parsed date changes
  React.useEffect(() => {
    if (parsedDate) {
      setHour(parsedDate.getHours())
      setMinute(parsedDate.getMinutes())
    }
  }, [parsedDate])

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return onSelect(null)

    const valid = !isNaN(selectedDate.getTime()) &&
      (!validateDate || validateDate(selectedDate))

    if (valid) {
      const newDate = new Date(selectedDate)
      if (showTime) {
        newDate.setHours(hour, minute, 0, 0)
      } else {
        newDate.setHours(0, 0, 0, 0)
      }
      onSelect(formatValueString(newDate, showTime))
    } else {
      onSelect(null)
    }
  }

  const handleTimeChange = (newHour: number) => {
    setHour(newHour)

    if (!showTime || !parsedDate) return

    const newDate = new Date(parsedDate)
    newDate.setHours(newHour, minute, 0, 0)
    onSelect(formatValueString(newDate, showTime))
  }

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute)

    if (!showTime || !parsedDate) return

    const newDate = new Date(parsedDate)
    newDate.setHours(hour, newMinute, 0, 0)
    onSelect(formatValueString(newDate, showTime))
  }

  const handleTodayClick = () => {
    const today = new Date()
    if (!validateDate || validateDate(today)) {
      if (showTime) {
        today.setHours(hour, minute, 0, 0)
      } else {
        today.setHours(0, 0, 0, 0)
      }
      onSelect(formatValueString(today, showTime))
    }
  }

  const isDateDisabled = (date: Date) => {
    const isInDisabledList = disabledDates.some(d => isSameDay(date, d))
    const isFuture = disableFutureDate && date > new Date()
    return isInDisabledList || isFuture
  }

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

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
          {parsedDate ? formatDateString(parsedDate, showTime) : <span>{showTime ? 'dd/mm/yyyy hh:mm' : t('common.selectDate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-4", showTime ? "w-[36rem] max-h-[24rem] overflow-auto" : "w-auto")} align="start">
        <div className={cn(showTime && "flex gap-4")}>
          <div className="flex-1">
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
                      {format(new Date(0, i), 'MMMM', { locale }).charAt(0).toUpperCase() + format(new Date(0, i), 'MMMM', { locale }).slice(1)}
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
            {today && (
              <Button
                variant="outline"
                className="mb-4 w-full"
                onClick={handleTodayClick}
              >
                {t('common.today')}
              </Button>
            )}

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
          </div>

          {showTime && (
            <div className="flex-1 pl-4 border-l">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {t('common.hour')}
                  </span>
                  <Select
                    value={hour.toString()}
                    onValueChange={(value) => handleTimeChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {h.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {t('common.minute')}
                  </span>
                  <Select
                    value={minute.toString()}
                    onValueChange={(value) => handleMinuteChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
