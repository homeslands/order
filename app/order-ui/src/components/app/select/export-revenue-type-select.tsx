import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { RevenueTypeQuery } from '@/constants'

interface SelectRevenueTypeProps {
  defaultValue?: string
  value?: string
  onChange: (value: string) => void
}

export default function RevenueTypeSelect({
  defaultValue,
  value,
  onChange,
}: SelectRevenueTypeProps) {
  const { t } = useTranslation(['revenue'])
  const [, setSelectedRevenueType] = useState<{
    value: string
    label: string
  } | null>(null)

  // Set default value when it's available
  useEffect(() => {
    if (defaultValue) {
      setSelectedRevenueType({
        value: defaultValue,
        label: defaultValue,
      })
    }
  }, [defaultValue])

  return (
    <Select
      onValueChange={(value) => {
        onChange(value)
        setSelectedRevenueType({
          value,
          label: value,
        })
      }}
      value={value || defaultValue}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('revenue.type')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('revenue.type')}</SelectLabel>
          <SelectItem value={RevenueTypeQuery.HOURLY}>{t('revenue.hourly')}</SelectItem>
          <SelectItem value={RevenueTypeQuery.DAILY}>{t('revenue.daily')}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
