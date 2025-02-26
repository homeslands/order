import { useTranslation } from "react-i18next"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui"
import { useTables } from "@/hooks"
import { useUserStore } from "@/stores"

export default function TableSelect() {
    const { t } = useTranslation('table')
    const { getUserInfo } = useUserStore()
    const { data: tables } = useTables(getUserInfo()?.branch.slug)

    const tableList = tables?.result || []
    console.log(tableList)

    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('product.chooseTool')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>
                        {t('product.tool')}
                    </SelectLabel>
                    <SelectItem value="create">

                    </SelectItem>
                    <SelectItem value="import">

                    </SelectItem>
                    <SelectItem value="exportAll">

                    </SelectItem>
                    <SelectItem value="exportTemplate">

                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
