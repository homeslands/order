import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useBranch } from "@/hooks";
import { useBranchStore } from "@/stores";

interface SelectBranchProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function BranchSelect({ defaultValue, onChange }: SelectBranchProps) {

  const [allBranches, setAllBranches] = useState<{ value: string; label: string }[]>([]);
  const { data } = useBranch();
  const { setBranch } = useBranchStore()

  useEffect(() => {
    if (defaultValue && data?.result) {
      const branch = data.result.find((item) => item.slug === defaultValue)
      if (branch) {
        setBranch(branch)
      }
    }
  }, [defaultValue, data?.result, setBranch])


  useEffect(() => {
    if (data?.result) {
      const newBranches = data.result.map((item) => ({
        value: item.slug || "",
        label: `${item.name} - ${item.address}`,
      }));
      setAllBranches(newBranches);
    }
  }, [data]);

  const handleChange = (value: string) => {
    const branch = data?.result.find((item) => item.slug === value)
    if (branch) {
      setBranch(branch)
    }
    onChange?.(value)
  }

  return (
    <Select onValueChange={handleChange} value={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Chọn chi nhánh" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Chi nhánh</SelectLabel>
          {allBranches.map((branch) => (
            <SelectItem key={branch.value} value={branch.value}>
              {branch.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
