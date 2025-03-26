import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { IChefArea } from '@/types'

interface ChefAreaSelectProps {
    chefAreas: IChefArea[]
    onSelect: (slug: string) => void
    value?: string
}

export default function ChefAreaSelect({
    chefAreas,
    onSelect,
    value,
}: ChefAreaSelectProps) {
    const { t } = useTranslation(['chefArea'])
    const [selectedValue, setSelectedValue] = useState<string>('')

    // Handle initial value and value updates
    useEffect(() => {
        if (value) {
            setSelectedValue(value)
        } else if (chefAreas.length > 0) {
            const firstChefArea = chefAreas[0].slug
            setSelectedValue(firstChefArea)
            onSelect(firstChefArea)
        }
    }, [value, chefAreas, onSelect])

    const handleSelect = (slug: string) => {
        setSelectedValue(slug)
        onSelect(slug)
    }

    return (
        <Select onValueChange={handleSelect} value={selectedValue}>
            <SelectTrigger className="w-48 h-10">
                <SelectValue placeholder={t('chefOrder.selectChefArea')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t('chefOrder.selectChefArea')}</SelectLabel>
                    {chefAreas.map((chefArea) => (
                        <SelectItem key={chefArea.slug} value={chefArea.slug}>
                            {chefArea.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
