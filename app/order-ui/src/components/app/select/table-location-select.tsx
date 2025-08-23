import { useEffect, useState } from 'react'
import ReactSelect, { ClassNamesConfig, SingleValue } from 'react-select'

import { useAllTableLocations } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const customClass : ClassNamesConfig<{ value: string; label: string }, false> = {
  control: (state) => {
    return cn(
      '!bg-background !border-input',
      state.isFocused && '!ring-ring !ring-1 !ring-offset-0',
    )
  },
  placeholder: () => {
    return cn(
      '!text-muted-foreground',
    )
  },
  dropdownIndicator: () => {
    return cn(
      '!text-muted-foreground opacity-50',
    )
  },
  indicatorSeparator: () => {
    return cn(
      '!bg-transparent',
    )
  },
  input: () => {
    return cn(
      '!text-foreground',
    )
  },
  singleValue: () => {
    return cn(
      '!text-foreground',
    )
  },
  menu: () => {
    return cn(
      '!bg-card !rounded-md ',
    )
  },
  option: (state) => {
    return cn(
      state.isSelected && '!bg-primary/10 !text-primary',
      state.isFocused && '!bg-primary/10',
    )
  },
}

interface SelectTableLocationProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function TableLocationSelect({
  defaultValue,
  onChange,
}: SelectTableLocationProps) {
  const [allTableLocations, setAllTableLocations] = useState<
    { value: string; label: string }[]
  >([])
  const [selectedTableLocation, setSelectedTableLocation] = useState<{
    value: string
    label: string
  } | null>(null)
  const { data } = useAllTableLocations()
  const { t } = useTranslation(['table'])

  useEffect(() => {
    if (data?.result) {
      const newTableLocations = data.result.map((item) => ({
        value: item.id || '',
        label: item.name || '',
      }))
      setAllTableLocations(newTableLocations)
    }
  }, [data])

  // Set default value when it's available
  useEffect(() => {
    if (defaultValue && allTableLocations.length > 0) {
      const defaultOption = allTableLocations.find(
        (tableLocation) => tableLocation.value === defaultValue,
      )
      if (defaultOption) {
        setSelectedTableLocation(defaultOption)
      }
    }
  }, [defaultValue, allTableLocations])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedTableLocation(selectedOption)
      onChange(selectedOption.value) // Only pass the value (slug)
    }
  }

  return (
    <ReactSelect
    classNames={customClass}
      placeholder={t('table.selectLocation')}
      noOptionsMessage={() => t('table.noOptions')}
      value={selectedTableLocation}
      onMenuScrollToBottom={() => {}}
      options={allTableLocations}
      onChange={handleChange}
      defaultValue={
        selectedTableLocation ||
        allTableLocations.find((option) => option.value === defaultValue)
      }
    />
  )
}
