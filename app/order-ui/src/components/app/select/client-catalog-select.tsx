import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('menu')
  const { getTheme } = useThemeStore()
  const [allCatalogs, setAllCatalogs] = useState<
    { value: string; label: string }[]
  >([{ value: '', label: t('menu.all') }])
  const [selectedCatalog, setSelectedCatalog] = useState<{
    value: string
    label: string
  } | null>({ value: '', label: t('menu.all') })
  const { data } = useCatalogs()

  useEffect(() => {
    if (data?.result) {
      const newCatalogs = data.result.map((item) => ({
        value: item.slug || '',
        label: item.name || '',
      }))
      setAllCatalogs([{ value: '', label: t('menu.all') }, ...newCatalogs])
    }
  }, [data, t])

  useEffect(() => {
    if (defaultValue && allCatalogs.length > 0) {
      const defaultOption = allCatalogs.find(
        (catalog) => catalog.value === defaultValue,
      )
      if (defaultOption) {
        setSelectedCatalog(defaultOption)
      }
    } else {
      setSelectedCatalog({ value: '', label: t('menu.all') })
    }
  }, [defaultValue, allCatalogs, t])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedCatalog(selectedOption)
      onChange(selectedOption.value)
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
