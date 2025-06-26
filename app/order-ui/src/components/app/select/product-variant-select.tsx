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
import { IProductVariant } from "@/types";

interface SelectProductVariantProps {
  defaultValue?: string;
  variant: IProductVariant[]
  onChange: (value: string) => void;
}

export default function ProductVariantSelect({ variant, defaultValue, onChange }: SelectProductVariantProps) {
  const [, setAllVariants] = useState<{ value: string; label: string }[]>([])
  const { t } = useTranslation(['product'])

  useEffect(() => {
    const newVariants = variant.map((item) => ({
      value: item.slug || '',
      label: (item.size.name?.[0]?.toUpperCase() + item.size.name?.slice(1)) || '',
    }));
    setAllVariants(newVariants)
  }, [variant]);
  return (
    <Select onValueChange={onChange} defaultValue={defaultValue} value={variant[0].slug}>
      <SelectTrigger className="text-xs w-fit min-w-24">
        <SelectValue placeholder={t('product.selectProductVariant')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {variant.map((item) => (
            <SelectItem key={item.slug} value={item.slug}>
              Size {item.size.name.toUpperCase()}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
