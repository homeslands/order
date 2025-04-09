import * as React from 'react'
import moment from 'moment'
import { CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { vi } from 'date-fns/locale'

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
import { format } from 'date-fns'

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
  onChange: (date: string | null) => void
  validateDate?: (date: Date) => boolean
  disabled?: boolean
  today?: boolean
  disabledDates?: Date[]
  showTime?: boolean
  startDate?: string | null
  endDate?: string | null
  isStartDate?: boolean
}

export default function DateAndTimePicker({
  date,
  onChange,
  validateDate,
  disabled,
  today,
  disabledDates = [],
  showTime = false,
}: DatePickerProps) {
  const { t } = useTranslation(['common'])
  const [month, setMonth] = React.useState<number>(date ? new Date(date.split('/').reverse().join('-')).getMonth() : new Date().getMonth())
  const [year, setYear] = React.useState<number>(date ? new Date(date.split('/').reverse().join('-')).getFullYear() : new Date().getFullYear())
  const years = generateYears(1920, new Date().getFullYear()) // 100 years range
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => {
    if (date) {
      const momentDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm'])
      return momentDate.isValid() ? momentDate.toDate() : new Date()
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })
  const [hour, setHour] = React.useState<number>(() => {
    if (date) {
      const momentDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm'])
      return momentDate.isValid() ? momentDate.hours() : 0
    }
    return 0
  })
  const [minute, setMinute] = React.useState<number>(() => {
    if (date) {
      const momentDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm'])
      return momentDate.isValid() ? momentDate.minutes() : 0
    }
    return 0
  })

  // Update internal date when value prop changes
  React.useEffect(() => {
    if (date) {
      const momentDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm'])
      if (momentDate.isValid()) {
        setSelectedDate(momentDate.toDate())
        setHour(momentDate.hours())
        setMinute(momentDate.minutes())
      }
    } else {
      // Set default value when date is null
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      setSelectedDate(now)
      setHour(0)
      setMinute(0)
      onChange(moment(now).format('YYYY-MM-DD HH:00:00'))
    }
  }, [date, onChange])

  const handleDateChange = (newDate?: Date) => {
    if (newDate) {
      // if (!isStartDate && !validateEndDate(newDate)) {
      //   alert(t('common.endDateMustBeGreaterThanStartDate'))
      //   return
      // }

      setSelectedDate(newDate)
      const momentDate = moment(newDate)
      momentDate.hours(hour)
      momentDate.minutes(0)
      momentDate.seconds(0)
      onChange(momentDate.format('YYYY-MM-DD HH:00:00'))
    }
  }

  const handleTimeChange = (newHour: number) => {
    setHour(newHour)
    setMinute(0)
    if (selectedDate) {
      const momentDate = moment(selectedDate)
      momentDate.hours(newHour)
      momentDate.minutes(0)
      momentDate.seconds(0)
      onChange(momentDate.format('YYYY-MM-DD HH:00:00'))
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    if (validateDate && validateDate(today)) {
      const momentDate = moment(today)
      momentDate.hours(hour)
      momentDate.minutes(0)
      momentDate.seconds(0)
      onChange(momentDate.format('YYYY-MM-DD HH:00:00'))
    }
  }

  const isDateDisabled = (date: Date) => {
    return disabledDates.some(disabledDate => moment(disabledDate).isSame(date, 'day'))
  }

  const formatDisplayDate = (date?: Date) => {
    if (!date) return ''
    const momentDate = moment(date)
    momentDate.hours(hour)
    momentDate.minutes(0)
    momentDate.seconds(0)
    return momentDate.format('YYYY-MM-DD HH:00:00')
  }

  // validate if end date is greater than or equal to start date
  // const validateEndDate = (endDate: Date) => {
  //   if (startDate) {
  //     const startMoment = moment(startDate, ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm'])
  //     const endMoment = moment(endDate)

  //     if (showTime) {
  //       endMoment.hours(hour)
  //       endMoment.minutes(minute)
  //     } else {
  //       startMoment.endOf('day')
  //       endMoment.startOf('day')
  //     }

  //     if (endMoment.isBefore(startMoment)) {
  //       return false
  //     }
  //   }
  //   return true
  // }

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
          {date ? formatDisplayDate(selectedDate) : <span>dd/mm/yyyy</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-[36rem] max-h-[24rem] overflow-auto" align="start">
        <div className="flex gap-4">
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
                      {format(new Date(0, i), 'MMMM', { locale: vi }).charAt(0).toUpperCase() + format(new Date(0, i), 'MMMM', { locale: vi }).slice(1)}
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
              selected={selectedDate}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              initialFocus
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
                    onValueChange={(value) => handleTimeChange(parseInt(value))}
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
