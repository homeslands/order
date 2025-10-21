import UpdateCoinPolicyDialog from "@/components/app/dialog/update-coin-policy-dialog";
import { Label, Switch } from "@/components/ui";
import { useToggleCoinPolicyActivation } from "@/hooks/use-coin-policies";
import { ICoinPolicy } from "@/types/coin-policy.type";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CoinPolicyItemActions({ data }: { data: ICoinPolicy }) {
    const { t } = useTranslation(['coinPolicy'])
    const { mutate: toggleCoinPolicyMutation } = useToggleCoinPolicyActivation();
    const queryClient = useQueryClient()


    const handleToggle = (value: boolean) => {
        toggleCoinPolicyMutation({ slug: data.slug, payload: { isActive: value } }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['coin-policies'] })
            }
        }
        )
    }

    return <>
        {/* Switch */}
        <div className="flex item-center gap-1">
            <Label
                htmlFor="lock-all-switch"
                className={`cursor-pointer font-semibold transition-colors ${data?.isActive
                    ? 'text-green-500 hover:text-green-500'
                    : 'text-red-600 hover:text-red-700'
                    }`}
            >
                {data?.isActive ? (
                    <div className="flex items-center gap-1">
                        {t('coinPolicy.active')}
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        {t('coinPolicy.inactive')}
                    </div>
                )}
            </Label>
            <Switch
                id="lock-all-switch"
                checked={data.isActive}
                onCheckedChange={(checked) => {
                    handleToggle(checked)
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-destructive"
            />
        </div>

        <UpdateCoinPolicyDialog data={data} />
    </>
}
