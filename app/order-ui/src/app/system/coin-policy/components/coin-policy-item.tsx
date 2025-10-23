import { ICoinPolicy } from "@/types/coin-policy.type"
import { formatCurrency } from "@/utils"
import CoinPolicyItemActions from "./coin-policy-item-actions"
import { CoinPolicyConstants } from "@/constants/coin-policy"
import { useTranslation } from "react-i18next"

export interface CoinPolicyItemProps {
  data: ICoinPolicy
}

export default function CoinPolicyItem({ data }: CoinPolicyItemProps) {
  const { t } = useTranslation(['coinPolicy'])
  const renderValue = (payload: { key: string, value: string }) => {
    switch (payload.key) {
      case CoinPolicyConstants.MAX_BALANCE:
        return formatCurrency(+payload.value, '')
      default:
        return payload.value
    }
  }

  const renderLabel = (payload: { key: string, value: string }) => {
    switch (payload.key) {
      case CoinPolicyConstants.MAX_BALANCE:
        return t('coinPolicy.maxBalance')
      default:
        return payload.value
    }
  }

  return (
    <>
      <div className="mt-2 flex flex-col gap-2 p-2 rounded-md dark:bg-transparent lg:flex-row lg:items-center">
        {/* Left */}
        <div className="w-2/5 text-sm font-bold">
          {renderLabel({ key: data.key, value: data.name })}:
        </div>

        {/* Center */}
        <div className="w-full flex items-center gap-4">
          <div className="border p-2 text-sm rounded-sm bg-gray-100 w-full dark:bg-transparent dark:border-gray-500"
          >
            {renderValue({ key: data.key, value: data.value })}
          </div>
          <CoinPolicyItemActions data={data} className="lg:hidden w-1/6" />
        </div>


        {/* Action */}
        <CoinPolicyItemActions data={data} className="hidden lg:flex w-1/3 justify-end" />
      </div>
    </>
  )
}