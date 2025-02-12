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

export default function ProductToolSelect() {
    const { t } = useTranslation('product')
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
