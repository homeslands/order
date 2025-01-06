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
    if (data?.result) {
      const newBranches = data.result.map((item) => ({
        value: item.slug || '',
        label: `${item.name} - ${item.address}`,
      }))
      setAllBranches(newBranches)

      // Set giá trị mặc định
      const defaultOption =
        defaultValue !== undefined
          ? newBranches.find((branch) => branch.value === defaultValue) // Nếu có defaultValue
          : newBranches[0] // Nếu không có, chọn giá trị đầu tiên
      if (defaultOption) {
        setSelectedBranch(defaultOption)
        onChange(defaultOption.value) // Gọi onChange với giá trị mặc định
      }
    }
  }, [data, defaultValue, onChange])

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
      className="w-full text-sm text-muted-foreground border-muted-foreground" // Độ rộng của component
      value={selectedBranch} // Hiển thị giá trị mặc định đã chọn
      options={allBranches} // Danh sách options
      onChange={handleChange}
      defaultValue={selectedBranch} // Giá trị mặc định
    // menuPortalTarget={document.body}
    // styles={{
    //   menuPortal: (base) => ({
    //     ...base,
    //     zIndex: 9999,
    //   }),
    //   menu: (base) => ({
    //     ...base,
    //     zIndex: 9999,
    //     borderRadius: "8px",
    //     overflow: "hidden",
    //     border: "1px solid #e5e7eb",
    //   }),
    //   menuList: (base) => ({
    //     ...base,
    //     padding: 0,
    //     maxHeight: "300px", // Đặt chiều cao tối đa
    //     overflowY: "auto", // Cuộn dọc khi danh sách quá dài
    //     scrollbarWidth: "thin", // Tinh chỉnh thanh cuộn trên Firefox
    //     '&::-webkit-scrollbar': {
    //       width: '6px', // Độ rộng của thanh cuộn trên Chrome, Edge
    //     },
    //     '&::-webkit-scrollbar-thumb': {
    //       backgroundColor: '#d1d5db', // Màu thanh cuộn
    //       borderRadius: '4px',
    //     },
    //     '&::-webkit-scrollbar-thumb:hover': {
    //       backgroundColor: '#9ca3af', // Màu thanh cuộn khi hover
    //     },
    //   }),
    //   control: (base) => ({
    //     ...base,
    //     borderRadius: "8px", // Thêm border radius cho control (full rounded)
    //     paddingLeft: "0.5rem",
    //     paddingRight: "0.5rem",
    //     borderColor: "#e5e7eb", // Màu border
    //     minHeight: "32px", // Thay đổi height thành minHeight để control chiều cao
    //     height: "40px", // Thêm height cố định
    //   }),
    //   option: (base, state) => ({
    //     ...base,
    //     cursor: "pointer",
    //     backgroundColor: state.isSelected ? "#f79e22" : "white", // orange-500 when selected
    //     color: state.isSelected ? "white" : base.color,
    //     "&:hover": {
    //       backgroundColor: state.isSelected ? "#f79e22" : "#f3f4f6",
    //     },
    //     "&:active": {
    //       backgroundColor: "#f79e22",
    //     },
    //   }),
    // }}
    />
  )
}
