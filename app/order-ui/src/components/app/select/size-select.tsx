import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useSize } from '@/hooks'

interface SelectSizeProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function SizeSelect({
  defaultValue,
  onChange,
}: SelectSizeProps) {
  const [allSizes, setAllSizes] = useState<{ value: string; label: string }[]>(
    [],
  )
  const [selectedSize, setSelectedSize] = useState<{
    value: string
    label: string
  } | null>(null)
  //   const { pagination, handlePageChange } = usePagination({ isSearchParams: false })
  const { data } = useSize()

  //   const handleScrollToBottom = () => {
  //     if (data?.result?.page && data.result.totalPages) {
  //       if (data.result.page < data.result.totalPages) handlePageChange(pagination.pageIndex + 1)
  //     }
  //   }

  // Effect to append new users to the local state when users are fetched
  useEffect(() => {
    if (data?.result) {
      const newSizes = data.result.map((item) => ({
        value: item.slug || '',
        label: item.name ? item.name.toUpperCase() : '',
      }))
      // Append new users to the previous users
      setAllSizes(newSizes)
    }
  }, [data])

  // Set default value when it's available
  useEffect(() => {
    if (defaultValue && allSizes.length > 0) {
      const defaultOption = allSizes.find((size) => size.value === defaultValue)
      if (defaultOption) {
        setSelectedSize(defaultOption)
      }
    }
  }, [defaultValue, allSizes])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedSize(selectedOption)
      onChange(selectedOption.value) // Only pass the value (slug)
    }
  }

  return (
    <ReactSelect
      value={selectedSize}
      onMenuScrollToBottom={() => { }}
      options={allSizes}
      onChange={handleChange}
      defaultValue={selectedSize}
    />
  )
}
