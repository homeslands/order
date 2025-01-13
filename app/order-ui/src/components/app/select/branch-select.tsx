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

  // Chỉ set giá trị mặc định một lần khi component mount hoặc khi data thay đổi
  useEffect(() => {
    if (data?.result && !selectedBranch) {
      const newBranches = data.result.map((item) => ({
        value: item.slug || '',
        label: `${item.name} - ${item.address}`,
      }))
      setAllBranches(newBranches)

      // Chỉ set default value nếu chưa có selectedBranch
      const defaultOption = defaultValue
        ? newBranches.find((branch) => branch.value === defaultValue)
        : newBranches[0]

      if (defaultOption) {
        setSelectedBranch(defaultOption)
        onChange(defaultOption.value)
      }
    }
  }, [data, defaultValue]) // Bỏ onChange khỏi dependencies

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
      className="w-full text-sm text-muted-foreground border-muted-foreground"
      value={selectedBranch}
      options={allBranches}
      onChange={handleChange}
    // Bỏ defaultValue prop vì chúng ta đã xử lý trong state
    />
  )
}
