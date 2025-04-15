import { FileDown, FileUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui"
import { useExportExcelRevenue, useExportPDFRevenue } from "@/hooks"
import { IRevenueQuery } from "@/types"
import { showToast } from "@/utils"
import { RevenueTypeQuery } from "@/constants"

export default function RevenueToolDropdown({ branch, startDate, endDate, revenueType }: { branch: string, startDate: string, endDate: string, revenueType: RevenueTypeQuery }) {
    const { t } = useTranslation('dashboard')
    const { t: tToast } = useTranslation('toast')
    const { mutate: exportExcelRevenue } = useExportExcelRevenue()
    const { mutate: exportPDFRevenue } = useExportPDFRevenue()

    const handleExportExcelRevenue = (data: IRevenueQuery) => {
        exportExcelRevenue(data, {
            onSuccess: () => {
                showToast(tToast('toast.exportRevenueSuccess'))
            }
        })
    }

    const handleExportPDFRevenue = (data: IRevenueQuery) => {
        exportPDFRevenue(data, {
            onSuccess: () => {
                showToast(tToast('toast.exportRevenueSuccess'))
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {t('dashboard.chooseTool')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-64">
                <DropdownMenuLabel>
                    {t('dashboard.tool')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => handleExportExcelRevenue({ branch, startDate, endDate, type: revenueType })}>
                        <div className="flex gap-1 items-center">
                            <FileDown className="icon" />
                            {t('dashboard.exportExcel')}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExportPDFRevenue({ branch, startDate, endDate, type: revenueType })}>
                        <div className="flex gap-1 items-center">
                            <FileUp className="icon" />
                            {t('dashboard.exportPDF')}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
