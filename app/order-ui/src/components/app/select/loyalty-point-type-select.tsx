import { useTranslation } from "react-i18next"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"

import { LoyaltyPointHistoryType } from "@/constants"

interface LoyaltyPointTypeSelectProps {
  defaultValue?: string
  value?: string
  onChange: (value: string | undefined) => void
}

const LOYALTY_POINT_TYPES = [
  { value: LoyaltyPointHistoryType.ADD, labelKey: "loyaltyPoint.type.add" },
  { value: LoyaltyPointHistoryType.USE, labelKey: "loyaltyPoint.type.use" },
  { value: LoyaltyPointHistoryType.RESERVE, labelKey: "loyaltyPoint.type.reserve" },
  { value: LoyaltyPointHistoryType.REFUND, labelKey: "loyaltyPoint.type.refund" },
]

export default function LoyaltyPointTypeSelect({
  value,
  defaultValue,
  onChange,
}: LoyaltyPointTypeSelectProps) {
  const { t } = useTranslation(["loyaltyPoint"])

  return (
    <Select onValueChange={onChange} defaultValue={defaultValue || 'all'} value={value || 'all'}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("loyaltyPoint.selectLoyaltyPointType")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem key={'all'} value={'all'}>
            {t("loyaltyPoint.type.all")}
          </SelectItem>
          {LOYALTY_POINT_TYPES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {t(item.labelKey)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
