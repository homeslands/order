import { Calendar } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { RevenueTypeQuery } from '@/constants'

interface DateSelectProps {
  onChange?: (timeRange: string) => void
}

export default function DateSelect({ onChange }: DateSelectProps) {
  const { t } = useTranslation(['common'])
  const handleSelectTimeRange = (timeRange: string) => {
    if (onChange) {
      onChange(timeRange)
    }
  }

  return (
    <Select onValueChange={handleSelectTimeRange} defaultValue={RevenueTypeQuery.DAILY}>
      <SelectTrigger className="w-[12rem] flex gap-1 shadow-none font-normal bg-white">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <SelectValue className="text-muted-foreground" placeholder={t('dayOfWeek.selectTimeRange')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel></SelectLabel> */}
          <SelectItem value={RevenueTypeQuery.DAILY}>
            {t('dayOfWeek.day')}
          </SelectItem>
          <SelectItem value={RevenueTypeQuery.MONTHLY}>
            {t('dayOfWeek.month')}
          </SelectItem>
          <SelectItem value={RevenueTypeQuery.YEARLY}>
            {t('dayOfWeek.year')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
