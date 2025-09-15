import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"

interface IConversionRule {
    id: string
    description: string
}

interface LoyaltyPointRulesProps {
    rules?: IConversionRule[] // quy tắc bổ sung
}

// constant quy đổi: 10 điểm = 1 VNĐ
const POINT_TO_MONEY_RATE = 1 // 1 points = 1 VND
const EARN_RATE = 10 // ví dụ: 10% giá trị đơn hàng

export default function LoyaltyPointRules({ rules = [] }: LoyaltyPointRulesProps) {
    const { t } = useTranslation(["loyaltyPoint"])

    return (
        <Card className="shadow-none">
            <CardHeader className="p-3 bg-muted-foreground/10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {t("loyaltyPoint.rulesTitle")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 text-sm font-medium text-muted-foreground">
                <p>
                    {t("loyaltyPoint.earnRate", {
                        percent: EARN_RATE,
                    })}
                </p>
                <p>
                    {t("loyaltyPoint.convertRate", {
                        points: POINT_TO_MONEY_RATE,
                        value: 1,
                    })}
                </p>
                {rules.length > 0 && (
                    <div className="mt-2 space-y-2">
                        <p className="font-medium text-muted-foreground">{t("loyaltyPoint.additionalRules")}</p>
                        <ul className="pl-5 space-y-1 list-disc">
                            {rules.map((rule) => (
                                <li key={rule.id}>{rule.description}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
