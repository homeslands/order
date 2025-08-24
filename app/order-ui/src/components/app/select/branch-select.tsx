import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { useBranch } from "@/hooks";
import { useBranchStore } from "@/stores";

interface SelectBranchProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function BranchSelect({ defaultValue, onChange }: SelectBranchProps) {
  const { t } = useTranslation('branch')
  const { setBranch, branch } = useBranchStore();
  const [allBranches, setAllBranches] = useState<{ value: string; label: string }[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue || branch?.slug);

  const { data } = useBranch();

  // Set selected branch with priority: store branch > defaultValue > first item
  useEffect(() => {
    if (!data?.result || data.result.length === 0) return;

    let targetBranch;

    // Priority 1: Branch from store (đã được chọn trước đó)
    if (branch && data.result.some(item => item.slug === branch.slug)) {
      targetBranch = branch;
    }
    // Priority 2: defaultValue prop
    else if (defaultValue) {
      targetBranch = data.result.find(item => item.slug === defaultValue);
    }

    // Priority 3: First item if no store branch or defaultValue
    if (!targetBranch) {
      targetBranch = data.result[0];
    }

    if (targetBranch) {
      setBranch(targetBranch);
      setSelectedValue(targetBranch.slug);
    }
  }, [defaultValue, data?.result, setBranch, branch]);

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
    setSelectedValue(value); // Update local state
    const branch = data?.result.find((item) => item.slug === value);
    if (branch) {
      setBranch(branch);
    }
    onChange?.(value);
  };

  return (
    <Select onValueChange={handleChange} value={selectedValue}>
      <SelectTrigger className="w-fit">
        <SelectValue placeholder={t('branch.chooseBranch')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            {t('branch.title')}
          </SelectLabel>
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
