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
import { PrinterDataType } from "@/constants";

interface PrinterDataTypeSelectProps {
  value?: PrinterDataType;
  onChange?: (value: PrinterDataType) => void;
}

export default function PrinterDataTypeSelect({ value, onChange }: PrinterDataTypeSelectProps) {
  const { t } = useTranslation('chefArea');

  const options: { value: PrinterDataType; label: string }[] = [
    { value: PrinterDataType.TSPL_ZPL, label: 'TSPL / ZPL' },
    { value: PrinterDataType.ESC_POS, label: 'ESC / POS' },
  ];

  return (
    <Select onValueChange={(val) => onChange?.(val as PrinterDataType)} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('printer.chooseDataType')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('printer.dataType')}</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
