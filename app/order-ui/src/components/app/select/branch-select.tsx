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
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function BranchSelect({ value, defaultValue, onChange }: SelectBranchProps) {
  const { t } = useTranslation('branch')
  const { setBranch, branch } = useBranchStore();
  const [allBranches, setAllBranches] = useState<{ value: string; label: string }[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value || defaultValue || branch?.slug);

  const { data } = useBranch();

  // Sync with controlled value from form
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Set selected branch with priority: controlled value > store branch > defaultValue > first item
  useEffect(() => {
    if (!data?.result || data.result.length === 0) return;

    let targetBranch;

    // Priority 1: Controlled value (from react-hook-form)
    if (value) {
      targetBranch = data.result.find(item => item.slug === value);
    }
    // Priority 2: Branch from store (đã được chọn trước đó)
    else if (branch && data.result.some(item => item.slug === branch.slug)) {
      targetBranch = branch;
    }
    // Priority 3: defaultValue prop
    else if (defaultValue) {
      targetBranch = data.result.find(item => item.slug === defaultValue);
    }

    // Priority 4: First item if no controlled value, store branch or defaultValue
    if (!targetBranch) {
      targetBranch = data.result[0];
    }

    if (targetBranch) {
      setBranch(targetBranch);
      setSelectedValue(targetBranch.slug);
      // Notify form about the default value
      if (!value && onChange) {
        onChange(targetBranch.slug);
      }
    }
  }, [value, defaultValue, data?.result, setBranch, branch, onChange]);

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