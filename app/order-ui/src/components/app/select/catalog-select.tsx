import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useCatalogs } from '@/hooks'

interface SelectCatalogProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function CatalogSelect({
  defaultValue,
  onChange,
}: SelectCatalogProps) {
  const [allCatalogs, setAllCatalogs] = useState<
    { value: string; label: string }[]
  >([])
  const [selectedCatalog, setSelectedCatalog] = useState<{
    value: string
    label: string
  } | null>(null)
  const { data } = useCatalogs()

  // Effect to append new catalogs to the previous catalogs
  useEffect(() => {
    if (data?.result) {
      const newCatalogs = data.result.map((item) => ({
        value: item.slug || '',
        label: (item.name?.[0]?.toUpperCase() + item.name?.slice(1)) || '',
      }))
      // Append new users to the previous users
      setAllCatalogs(newCatalogs)
    }
  }, [data])

  // Set default value when it's available
  useEffect(() => {
    if (defaultValue && allCatalogs.length > 0) {
      const defaultOption = allCatalogs.find(
        (catalog) => catalog.value === defaultValue,
      )
      if (defaultOption) {
        setSelectedCatalog(defaultOption)
      }
    }
  }, [defaultValue, allCatalogs])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedCatalog(selectedOption)
      onChange(selectedOption.value) // Only pass the value (slug)
    }
  }

  return (
    <ReactSelect
      value={selectedCatalog}
      onMenuScrollToBottom={() => { }}
      options={allCatalogs}
      onChange={handleChange}
      defaultValue={selectedCatalog}
    />
  )
}
