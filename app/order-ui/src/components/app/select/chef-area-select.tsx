import { useEffect } from 'react'
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
import { useSelectedChefOrderStore } from '@/stores'

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
    const { setChefOrderByChefAreaSlug } = useSelectedChefOrderStore()

    // Set default value to first chefArea slug if value is not set
    useEffect(() => {
        if (!value && chefAreas.length > 0) {
            const firstChefArea = chefAreas[0].slug
            setChefOrderByChefAreaSlug(firstChefArea)
            onSelect(firstChefArea) // Ensure parent state is updated
        }
    }, [chefAreas, value, setChefOrderByChefAreaSlug, onSelect])

    const handleSelect = (slug: string) => {
        onSelect(slug)
    }

    return (
        <Select onValueChange={handleSelect} value={value ?? chefAreas[0]?.slug}>
            <SelectTrigger className="w-32 h-10 sm:w-48">
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
