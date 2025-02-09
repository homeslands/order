import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useBranch } from '@/hooks'

interface SelectVoucherTypeProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function VoucherTypeSelect({
  defaultValue,
  onChange,
}: SelectVoucherTypeProps) {
  const [allVoucherTypes, setAllVoucherTypes] = useState<
    { value: string; label: string }[]
  >([])
  const [selectedVoucherType, setSelectedVoucherType] = useState<{
    value: string
    label: string
  } | null>(null)
  const { data } = useBranch()

  useEffect(() => {
    if (data?.result && !selectedVoucherType) {
      const newVoucherTypes = data.result.map((item) => ({
        value: item.slug || '',
        label: `${item.name} - ${item.address}`,
      }))
      setAllVoucherTypes(newVoucherTypes)

      const defaultOption = defaultValue
        ? newVoucherTypes.find((branch) => branch.value === defaultValue)
        : newVoucherTypes[0]

      if (defaultOption) {
        setSelectedVoucherType(defaultOption)
        onChange(defaultOption.value)
      }
    }
  }, [data, defaultValue, onChange, selectedVoucherType]) // Bỏ onChange khỏi dependencies

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedVoucherType(selectedOption)
      onChange(selectedOption.value)
    }
  }

  return (
    <ReactSelect
      className="w-full text-sm border-muted-foreground text-muted-foreground"
      value={selectedVoucherType}
      options={allVoucherTypes}
      onChange={handleChange}
    />
  )
}
