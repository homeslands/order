import { useTranslation } from 'react-i18next'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui'
import { ChefOrderStatus } from '@/types'
import { useEffect } from 'react'

interface ChefOrderStatusSelectProps {
    onSelect: (slug: string) => void
    value?: string | null
}

export default function ChefOrderStatusSelect({
    onSelect,
    value = null, // default: nothing selected yet
}: ChefOrderStatusSelectProps) {
    const { t } = useTranslation(['chefArea'])

    const chefOrderStatus = Object.values(ChefOrderStatus).map((status) => ({
        value: status,
        label: t(`chefOrder.${status}`),
    }))

    // set default value to first chefOrderStatus if value is not set
    useEffect(() => {
        if (!value && chefOrderStatus.length > 0) {
            const firstChefOrderStatus = chefOrderStatus[0].value
            onSelect(firstChefOrderStatus)
        }
    }, [value, chefOrderStatus, onSelect])

    const statusOptions = [
        { value: 'all', label: t('chefOrder.all') },
        ...chefOrderStatus,
    ]

    const handleSelect = (value: string) => {
        onSelect(value)
    }

    return (
        <Select onValueChange={handleSelect} value={value ?? undefined}>
            <SelectTrigger className="h-10 min-w-36 w-fit">
                <SelectValue placeholder={t('chefOrder.selectChefOrderStatus')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t('chefOrder.selectChefOrderStatus')}</SelectLabel>
                    {statusOptions.map((option, index) => (
                        <SelectItem key={index} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
