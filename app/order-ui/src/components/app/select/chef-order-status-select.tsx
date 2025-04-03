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

interface ChefOrderStatusSelectProps {
    onSelect: (slug: string) => void
    value?: string
}
export default function ChefOrderStatusSelect({
    onSelect,
    value = 'all',
}: ChefOrderStatusSelectProps) {
    const { t } = useTranslation(['chefArea'])
    const chefOrderStatus = Object.values(ChefOrderStatus).map((status) => ({
        value: status,
        label: t(`chefOrder.${status}`), // Dịch ngôn ngữ động
    }))

    // Thêm option "Tất cả" vào đầu danh sách
    const statusOptions = [
        { value: 'all', label: t('chefOrder.all') },
        ...chefOrderStatus,
    ]
    const handleSelect = (value: string) => {
        onSelect(value)
    }

    return (
        <Select onValueChange={handleSelect} value={value}>
            <SelectTrigger className="h-10 min-w-36 w-fit">
                <SelectValue placeholder={t('chefOrder.selectChefOrderStatus')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t('chefOrder.selectChefOrderStatus')}</SelectLabel>
                    {statusOptions?.length > 0 && statusOptions.map((chefOrderStatus, index) => (
                        <SelectItem key={index} value={chefOrderStatus.value}>
                            {chefOrderStatus.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
