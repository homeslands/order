import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '@/stores'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { APPLICABILITY_RULE } from '@/constants'

export default function VoucherApplicabilityRuleSelect({
  onChange,
  defaultValue,
}: {
  onChange: (value: string) => void
  defaultValue?: string
}) {
  const { getTheme } = useThemeStore()
  const { t } = useTranslation('voucher')
  const [selectedVoucherApplicabilityRule, setSelectedVoucherApplicabilityRule] = useState<string>(defaultValue || '')

  useEffect(() => {
    if (defaultValue) {
      setSelectedVoucherApplicabilityRule(defaultValue)
    }
  }, [defaultValue])

  const options = useMemo(
    () => [
      { label: t('voucher.allRequired'), value: APPLICABILITY_RULE.ALL_REQUIRED },
      { label: t('voucher.atLeastOneRequired'), value: APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED },
    ],
    [t]
  )

  const handleChange = (val: string) => {
    setSelectedVoucherApplicabilityRule(val)
    if (onChange) {
      onChange(val)
    }
  }

  return (
    <Select value={selectedVoucherApplicabilityRule} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('voucher.selectRule')} />
      </SelectTrigger>
      <SelectContent className={getTheme() === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
