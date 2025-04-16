import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui";
import { RevenueTypeSelect } from "../select";
import { RevenueFilterForm } from "../form";
import { RevenueTypeQuery } from "@/constants";
import { IRevenueQuery } from "@/types";

export default function RevenueFilterPopover({ onApply }: { onApply: (data: IRevenueQuery) => void }) {
    const { t } = useTranslation(["revenue"]);
    const [revenueType, setRevenueType] = useState<RevenueTypeQuery>(RevenueTypeQuery.DAILY);
    const [open, setOpen] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleExportRevenue = (data: IRevenueQuery) => {
        onApply(data)
        setOpen(false)
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Settings2 />
                    {t("revenue.filter")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[32rem]">
                <div className="flex flex-col gap-1 w-full">
                    <div className="space-y-2">
                        <span className="font-bold leading-none text-md">{t("revenue.exportRevenue")}</span>
                    </div>
                    <RevenueTypeSelect defaultValue={revenueType} onChange={(value) => setRevenueType(value as RevenueTypeQuery)} />
                    <RevenueFilterForm onSubmit={handleExportRevenue} type={revenueType} onSuccess={() => setOpen(false)} />
                </div>
            </PopoverContent>
        </Popover>
    );
}
