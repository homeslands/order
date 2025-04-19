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
  const [allBranches, setAllBranches] = useState<{ value: string; label: string }[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);

  const { data } = useBranch();
  const { setBranch } = useBranchStore();

  // Set selected branch if defaultValue matches
  useEffect(() => {
    if (!data?.result || data.result.length === 0) return;

    const branch = data.result.find(item => item.slug === defaultValue) || data.result[0];

    setBranch(branch);
    setSelectedValue(branch.slug);
  }, [defaultValue, data?.result, setBranch]);

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
