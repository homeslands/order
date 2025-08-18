import { CancelGiftCardOrderDialog } from "@/components/app/dialog";
import { CardOrderStatus } from "@/constants";
import { useCancelCardOrder } from "@/hooks";
import { ICardOrderResponse } from "@/types";
import { showToast } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";

export default function CardOrderActionCell({ rowData }: { rowData: ICardOrderResponse }) {
    const { mutate } = useCancelCardOrder();
    const queryClient = useQueryClient();
    const { t } = useTranslation(['giftCard', 'common'])

    const handleCancelCardOrder = () => {
        mutate(rowData?.slug, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cardOrders'] });
                showToast(
                    t(
                        'giftCard.cardOrder.cancelSuccessful',
                    ),
                )
            },
        });
    }

    return (
        <div className="flex items-center gap-2">
            {rowData?.status === CardOrderStatus.PENDING &&
                <>
                    <div
                        data-tooltip-id="update-payment"
                        data-tooltip-content={t('giftCard.cardOrder.updatePayment')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CreditCardIcon className="cursor-pointer text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" />
                        <Tooltip id="update-payment" variant="light" />
                    </div>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        data-tooltip-id="cancel-order"
                        data-tooltip-content={t('giftCard.cardOrder.cancel')}
                    >
                        <CancelGiftCardOrderDialog onConfirm={handleCancelCardOrder} hideLabel={true} />
                        <Tooltip id="cancel-order" variant="light" />
                    </div>
                </>
            }
        </div>
    )
}