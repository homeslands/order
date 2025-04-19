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

import { DeliveryOrderType } from "@/types";

interface SelectDeliveryOrderTypeProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function DeliveryOrderTypeSelect({ defaultValue, onChange }: SelectDeliveryOrderTypeProps) {
  const { t } = useTranslation('menu')
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);

  // Set selected branch if defaultValue matches
  useEffect(() => {
    setSelectedValue(defaultValue); // Update local state
    onChange?.(defaultValue || '');
  }, [defaultValue, onChange]);

  return (
    <Select onValueChange={onChange} value={selectedValue}>
      <SelectTrigger className="w-fit border-muted-foreground/40">
        <SelectValue placeholder={t('branch.chooseBranch')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            {t('order.deliveryOrderType')}
          </SelectLabel>
          <SelectItem value={DeliveryOrderType.PENDING}>
            {t('order.pending')}
          </SelectItem>
          <SelectItem value={DeliveryOrderType.SHIPPING}>
            {t('order.shipping')}
          </SelectItem>
          <SelectItem value={DeliveryOrderType.COMPLETED}>
            {t('order.completed')}
          </SelectItem>
          <SelectItem value={DeliveryOrderType.FAILED}>
            {t('order.failed')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
