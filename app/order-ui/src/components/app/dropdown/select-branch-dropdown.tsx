import { MapPinIcon } from 'lucide-react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useBranch } from '@/hooks'
import { useBranchStore } from '@/stores/branch.store'

export default function SelectBranchDropdown() {
  const { data: branchRes } = useBranch()
  const { branch, setBranch } = useBranchStore()

  const handleSelectChange = (value: string) => {
    const b = branchRes?.result.find((item) => item.slug === value)
    setBranch(b)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <MapPinIcon className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-1 mr-2">
        <Select
          value={branch?.slug}
          onValueChange={(value) => handleSelectChange(value)}
        >
          <SelectTrigger className="w-full h-8">
            <SelectValue
              className="text-xs"
              placeholder={'Lựa chọn chi nhánh'}
            />
          </SelectTrigger>
          <SelectContent>
            {branchRes?.result.map((item) => {
              return (
                <SelectItem value={item.slug} key={item.slug}>
                  <span className="text-xs">{item.address}</span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
