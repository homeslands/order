import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useCatalogs } from '@/hooks'
import { useThemeStore } from '@/stores'

interface SelectCatalogProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function CatalogSelect({
  defaultValue,
  onChange,
}: SelectCatalogProps) {
  const { getTheme } = useThemeStore()
  const [allCatalogs, setAllCatalogs] = useState<
    { value: string; label: string }[]
  >([{ value: '', label: 'Tất cả' }]) // Option "Tất cả" mặc định
  const [selectedCatalog, setSelectedCatalog] = useState<{
    value: string
    label: string
  } | null>({ value: '', label: 'Tất cả' }) // Mặc định chọn "Tất cả"
  const { data } = useCatalogs()

  // Effect để cập nhật danh sách danh mục khi fetch xong
  useEffect(() => {
    if (data?.result) {
      const newCatalogs = data.result.map((item) => ({
        value: item.slug || '',
        label: item.name || '',
      }))
      // Thêm tùy chọn "Tất cả" vào danh sách
      setAllCatalogs([{ value: '', label: 'Tất cả' }, ...newCatalogs])
    }
  }, [data])

  // Set giá trị mặc định khi có `defaultValue`
  useEffect(() => {
    if (defaultValue && allCatalogs.length > 0) {
      const defaultOption = allCatalogs.find(
        (catalog) => catalog.value === defaultValue,
      )
      if (defaultOption) {
        setSelectedCatalog(defaultOption)
      }
    } else {
      setSelectedCatalog({ value: '', label: 'Tất cả' }) // Nếu không có giá trị mặc định, chọn "Tất cả"
    }
  }, [defaultValue, allCatalogs])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedCatalog(selectedOption)
      onChange(selectedOption.value) // Chỉ gửi giá trị (slug)
    }
  }

  return (
    <ReactSelect
      className="w-full text-sm"
      value={selectedCatalog}
      options={allCatalogs}
      onChange={handleChange}
      defaultValue={selectedCatalog}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: getTheme() === 'light' ? 'white' : '',
          borderColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: getTheme() === 'light' ? 'white' : '#121212',
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isFocused
            ? getTheme() === 'light'
              ? '#e2e8f0'
              : '#2d2d2d'
            : getTheme() === 'light'
              ? 'white'
              : '#121212',
          color: getTheme() === 'light' ? 'black' : 'white',
          '&:hover': {
            backgroundColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
          },
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: getTheme() === 'light' ? 'black' : 'white',
        }),
      }}
    />
  )
}
