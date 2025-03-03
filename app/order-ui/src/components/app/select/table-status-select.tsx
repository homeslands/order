import { useTranslation } from "react-i18next"
import { TableStatus } from "@/constants"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui"

interface TableStatusSelectProps {
    value?: string
    onChange: (value: string) => void
}

export default function TableStatusSelect({ value, onChange }: TableStatusSelectProps) {
    const { t } = useTranslation('table')

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={t('table.chooseStatus')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>
                        {t('table.status')}
                    </SelectLabel>
                    {Object.values(TableStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                            <span>
                                {t(`table.${status.toLowerCase()}`)}
                            </span>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
