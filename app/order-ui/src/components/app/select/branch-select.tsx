import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useBranch } from '@/hooks'
import { useThemeStore } from '@/stores'

interface SelectBranchProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function BranchSelect({
  defaultValue,
  onChange,
}: SelectBranchProps) {
  const { getTheme } = useThemeStore()
  const [allBranches, setAllBranches] = useState<
    { value: string; label: string }[]
  >([])
  const [selectedBranch, setSelectedBranch] = useState<{
    value: string
    label: string
  } | null>(null)
  const { data } = useBranch()

  useEffect(() => {
    if (data?.result && !selectedBranch) {
      const newBranches = data.result.map((item) => ({
        value: item.slug || '',
        label: `${item.name} - ${item.address}`,
      }))
      setAllBranches(newBranches)

      const defaultOption = defaultValue
        ? newBranches.find((branch) => branch.value === defaultValue)
        : newBranches[0]

      if (defaultOption) {
        setSelectedBranch(defaultOption)
        onChange(defaultOption.value)
      }
    }
  }, [data, defaultValue, onChange, selectedBranch]) // Bỏ onChange khỏi dependencies

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedBranch(selectedOption)
      onChange(selectedOption.value)
    }
  }

  return (
    <ReactSelect
      className="text-sm max-w-[16rem] border-muted-foreground text-muted-foreground"
      value={selectedBranch}
      options={allBranches}
      onChange={handleChange}
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
