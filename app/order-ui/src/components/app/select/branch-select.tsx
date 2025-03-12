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

interface SelectBranchProps {
  defaultValue?: string;
  onChange: (value: string) => void;
}

export default function BranchSelect({ defaultValue, onChange }: SelectBranchProps) {

  const [allBranches, setAllBranches] = useState<{ value: string; label: string }[]>([]);
  const { data } = useBranch();

  useEffect(() => {
    if (data?.result) {
      const newBranches = data.result.map((item) => ({
        value: item.slug || "",
        label: `${item.name} - ${item.address}`,
      }));
      setAllBranches(newBranches);
    }
  }, [data]);

  return (
    <Select onValueChange={onChange} defaultValue={defaultValue}>
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
