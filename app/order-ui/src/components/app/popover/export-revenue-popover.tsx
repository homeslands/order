import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui";
import { useExportRevenue } from "@/hooks";
import { showToast } from "@/utils";
import { RevenueTypeSelect } from "../select";
import { ExportRevenueForm } from "../form";
import { RevenueTypeQuery } from "@/constants";
import { useBranchStore } from "@/stores";
import { IRevenueQuery } from "@/types";

export default function ExportRevenuePopover() {
    const { t } = useTranslation(["revenue"]);
    const [revenueType, setRevenueType] = useState<RevenueTypeQuery>(RevenueTypeQuery.DAILY);
    const [open, setOpen] = useState(false);
    const { branch } = useBranchStore();
    const { mutate: exportRevenue } = useExportRevenue();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleExportRevenue = (data: IRevenueQuery) => {
        if (data.startDate && data.endDate) {
            // Chuyển đổi startDate và endDate thành định dạng 'yyyy-MM-dd'
            const start = new Date(data.startDate.split('/').reverse().join('-'));
            const end = new Date(data.endDate.split('/').reverse().join('-'));

            if (end < start) {
                alert(t("revenue.invalidDateRange"));
                return;
            }

            exportRevenue({
                branch: branch?.slug,
                startDate: data.startDate,
                endDate: data.endDate,
            }, {
                onSuccess: () => {
                    showToast(t("toast.exportRevenueSuccess"));
                    setOpen(false);
                }
            });
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Settings2 />
                    {t("revenue.export")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[36rem]">
                <div className="flex flex-col gap-1 w-full">
                    <div className="space-y-2">
                        <span className="font-bold leading-none text-md">{t("revenue.exportRevenue")}</span>
                        {/* <p className="text-sm text-muted-foreground">
                            {t("revenue.dateRangeDescription")}
                        </p> */}
                    </div>
                    <RevenueTypeSelect defaultValue={revenueType} onChange={(value) => setRevenueType(value as RevenueTypeQuery)} />
                    <ExportRevenueForm onSubmit={handleExportRevenue} type={revenueType} onSuccess={() => setOpen(false)} />
                </div>
            </PopoverContent>
        </Popover>
    );
}
