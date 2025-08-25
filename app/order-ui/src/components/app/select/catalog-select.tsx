import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { ICatalog } from "@/types";

interface SelectCatalogProps {
  defaultValue?: string;
  value: string
  onChange: (value: string | undefined) => void;
}

export default function CatalogSelect({ value, defaultValue, onChange }: SelectCatalogProps) {
  const [allCatalogs, setAllCatalogs] = useState<{ value: string; label: string }[]>([])
  const queryClient = useQueryClient();
  const { t } = useTranslation(['product'])
  useEffect(() => {
    const data = queryClient.getQueryData<{ result: ICatalog[] }>(['catalogs'])
    if (data?.result) {
      const newCatalogs = data.result.map((item) => ({
        value: item.slug || '',
        label: (item.name?.[0]?.toUpperCase() + item.name?.slice(1)) || '',
      }));
      setAllCatalogs(newCatalogs)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Select onValueChange={onChange} defaultValue={defaultValue} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('product.selectProductCatalog')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allCatalogs.map((catalog) => (
            <SelectItem key={catalog.value} value={catalog.value}>
              {catalog.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
