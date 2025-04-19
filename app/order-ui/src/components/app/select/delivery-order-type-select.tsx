import { useState } from "react";
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

import { OrderItemStatus } from "@/types";

interface SelectDeliveryOrderTypeProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function DeliveryOrderTypeSelect({ defaultValue, onChange }: SelectDeliveryOrderTypeProps) {
  const { t } = useTranslation('menu')
  const [selectedValue, setSelectedValue] = useState<string | undefined>(defaultValue);

  // Set selected type if defaultValue matches
  // useEffect(() => {
  //   setSelectedValue(defaultValue); // Update local state
  //   onChange?.(defaultValue || '');
  // }, [defaultValue, onChange]);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onChange?.(value);
  }

  return (
    <Select onValueChange={handleChange} value={selectedValue}>
      <SelectTrigger className="w-fit border-muted-foreground/40">
        <SelectValue placeholder={t('order.deliveryOrderType')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('order.deliveryOrderType')}</SelectLabel>
          <SelectItem value={OrderItemStatus.ORDER_ITEM_LIST}>
            {t('order.orderItemList')}
          </SelectItem>
          <SelectItem value={OrderItemStatus.PENDING}>
            {t('order.pending')}
          </SelectItem>
          <SelectItem value={OrderItemStatus.RUNNING}>
            {t('order.running')}
          </SelectItem>
          <SelectItem value={OrderItemStatus.COMPLETED}>
            {t('order.completed')}
          </SelectItem>
          <SelectItem value={OrderItemStatus.FAILED}>
            {t('order.failed')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
