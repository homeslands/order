import { ICoinPolicy } from "@/types/coin-policy.type"
import { formatCurrency } from "@/utils"
import CoinPolicyItemActions from "./coin-policy-item-actions"
import { useTranslation } from "react-i18next"

export interface CoinPolicyItemProps {
  data: ICoinPolicy
}

export default function CoinPolicyItem({ data }: CoinPolicyItemProps) {
  const renderValue = (payload: { key: string, value: string }) => {
    switch (payload.key) {
      case 'MAX_BALANCE':
        return formatCurrency(+payload.value, '')
      default:
        return payload.value
    }
  }
  return (
    <>
      <div className="mt-2 flex flex-col gap-2 p-2 rounded-md dark:bg-transparent lg:flex-row items-center">
        {/* Left */}
        <div className="w-2/5 text-sm font-bold">
          {data.name}:
        </div>

        {/* Center */}
        <div className="border w-full p-2 text-sm rounded-sm bg-gray-100"
        >
          {renderValue({ key: data.key, value: data.value })}
        </div>

        {/* Action */}
        <div className="items-end justify-end hidden col-span-1 gap-2 ml-auto lg:flex w-1/3">
          <CoinPolicyItemActions data={data} />
        </div>
      </div>
    </>
  )
}