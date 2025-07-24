import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

import { useCatalogs } from '@/hooks'
import { useThemeStore } from '@/stores'

interface SystemHorizontalCatalogSelectorProps {
    defaultValue?: string
    onChange: (value: string) => void
}

export default function SystemHorizontalCatalogSelect({
    defaultValue,
    onChange,
}: SystemHorizontalCatalogSelectorProps) {
    const { t } = useTranslation('menu')
    const { getTheme } = useThemeStore()
    const [selected, setSelected] = useState<string>(defaultValue || '')
    const [catalogs, setCatalogs] = useState<{ label: string; value: string }[]>([
        { value: '', label: t('menu.all') },
    ])
    const { data } = useCatalogs()

    useEffect(() => {
        if (data?.result) {
            const newCatalogs = data.result.map((item) => ({
                value: item.slug || '',
                label: item.name || '',
            }))
            setCatalogs([{ value: '', label: t('menu.all') }, ...newCatalogs])
        }
    }, [data, t])

    useEffect(() => {
        setSelected(defaultValue || '')
    }, [defaultValue])

    const handleClick = (value: string) => {
        setSelected(value)
        onChange(value)
    }

    // const extendedCatalogs = Array(5).fill(catalogs).flat(); // Lặp lại catalogs 5 lần

    return (
        <div className="max-w-sm overflow-x-auto sm:max-w-4xl">
            <div className="flex items-center gap-2 pb-2">
                {catalogs.map((catalog, index) => (
                    <button
                        key={`${catalog.value}-${index}`}
                        onClick={() => handleClick(catalog.value)}
                        className={clsx(
                            'flex-shrink-0 px-4 py-1 rounded-full border text-sm whitespace-nowrap transition-all duration-200',
                            selected === catalog.value
                                ? getTheme() === 'light'
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-black border-white'
                                : getTheme() === 'light'
                                    ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                    : 'bg-[#1e1e1e] text-gray-300 border-gray-600 hover:bg-[#2a2a2a]'
                        )}
                    >
                        {catalog?.label.charAt(0).toUpperCase() + catalog?.label.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    )
}
