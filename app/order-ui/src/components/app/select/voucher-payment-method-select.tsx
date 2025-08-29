import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Banknote, DollarSign, Star, AlertCircle } from "lucide-react"

import { Toggle } from "@/components/ui"
import { cn } from "@/lib/utils"
import { VOUCHER_PAYMENT_METHOD } from "@/constants"
import { IVoucher } from "@/types"

const PAYMENT_METHODS = [
  { key: VOUCHER_PAYMENT_METHOD.CASH, label: "voucher.paymentMethod.cash", icon: <DollarSign className="w-4 h-4" /> },
  { key: VOUCHER_PAYMENT_METHOD.BANK_TRANSFER, label: "voucher.paymentMethod.bankTransfer", icon: <Banknote className="w-4 h-4" /> },
  { key: VOUCHER_PAYMENT_METHOD.POINT, label: "voucher.paymentMethod.point", icon: <Star className="w-4 h-4" /> },
]

interface VoucherPaymentMethodSelectProps {
  onChange: (values: string[]) => void
  error?: string
  disabled?: boolean
  voucher?: IVoucher
  initialValues?: string[]
}

export default function VoucherPaymentMethodSelect({
  onChange,
  error,
  disabled = false,
  voucher,
  initialValues,
}: VoucherPaymentMethodSelectProps) {
  const { t } = useTranslation(["voucher"])
  const [selected, setSelected] = useState<string[]>(
    initialValues || voucher?.voucherPaymentMethods?.map((method) => method.paymentMethod) || []
  )
  const [hasError, setHasError] = useState(false)

  const toggleMethod = (key: string) => {
    if (disabled) return

    let newSelected: string[]

    if (selected.includes(key)) {
      // Kiểm tra nếu đây là phương thức cuối cùng
      if (selected.length === 1) {
        setHasError(true)
        return // Không cho phép xóa phương thức cuối cùng
      }
      newSelected = selected.filter((item) => item !== key)
      setHasError(false)
    } else {
      newSelected = [...selected, key]
      setHasError(false)
    }

    setSelected(newSelected)
    onChange(newSelected)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selected.includes(method.key)
          const isLastSelected = selected.length === 1 && isSelected

          return (
            <Toggle
              key={method.key}
              pressed={isSelected}
              onPressedChange={() => toggleMethod(method.key)}
              disabled={disabled}
              className={cn(
                "relative px-4 py-3 rounded-xl border-2 min-w-[140px]",
                "flex items-center justify-center gap-2 font-medium text-sm transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border text-foreground hover:border-primary hover:text-black",
                hasError && isLastSelected && "border-destructive text-destructive"
              )}
            >
              <span className={cn("flex gap-2 items-center")}>
                {method.icon}
                {t(method.label)}
              </span>

              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 bg-primary border-background" />
              )}
            </Toggle>
          )
        })}
      </div>

      {(hasError || error) && (
        <div className="flex gap-2 items-center text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error || t("voucher.paymentMethod.error")}</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {selected.length === 0
          ? t("voucher.paymentMethod.error")
          : `${t("voucher.paymentMethod.selected")} ${selected.length}/${PAYMENT_METHODS.length} ${t("voucher.paymentMethod.paymentMethods")}`}
      </div>
    </div>
  )
}
