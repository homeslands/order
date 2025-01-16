import { useEffect, useState } from 'react'
import ReactSelect, { SingleValue } from 'react-select'

import { useBranch } from '@/hooks'

interface SelectBranchProps {
  defaultValue?: string
  onChange: (value: string) => void
}

export default function BranchSelect({
  defaultValue,
  onChange,
}: SelectBranchProps) {
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
      className="w-full border-muted-foreground text-sm text-muted-foreground"
      value={selectedBranch}
      options={allBranches}
      onChange={handleChange}
    />
  )
}
