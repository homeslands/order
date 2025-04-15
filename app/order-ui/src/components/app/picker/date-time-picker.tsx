import * as React from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TimePickerInput, Label } from '@/components/ui'

interface DateTimePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate, onSelect }: DateTimePickerProps) {
  const { t } = useTranslation(['common'])
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const secondRef = React.useRef<HTMLInputElement>(null)

  const handleSelectDate = (date: Date | undefined) => {
    setDate(date)
    onSelect(date)
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          {t('common.hours')}
        </Label>
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={handleSelectDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          {t('common.minutes')}
        </Label>
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={handleSelectDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          {t('common.seconds')}
        </Label>
        <TimePickerInput
          picker="seconds"
          date={date}
          setDate={handleSelectDate}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="flex items-center h-10">
        <Clock className="ml-2 w-4 h-4" />
      </div>
    </div>
  )
}
