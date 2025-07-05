import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Switch } from '@/components/ui'
import { IPrinterForCHefArea } from '@/types'
import { useTogglePrinterForChefArea } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IPrinterToggleSwitchProps {
    printer: IPrinterForCHefArea
    disabled?: boolean
    onSuccess?: () => void
}

export default function PrinterToggleSwitch({
    printer,
    disabled,
    onSuccess,
}: IPrinterToggleSwitchProps) {
    const queryClient = useQueryClient()
    const { t: tToast } = useTranslation('toast')
    const { slug } = useParams()
    const { mutate: togglePrinter } = useTogglePrinterForChefArea()

    const handleToggle = () => {
        if (!slug || !printer?.slug) return
        togglePrinter(
            { slug, printerSlug: printer.slug },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: [QUERYKEY.chefAreaPrinters, slug],
                        exact: false,
                        refetchType: 'all',
                    })
                    onSuccess?.()
                    showToast(tToast('toast.updateChefAreaPrinterSuccess'))
                },
            }
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={printer.isActive}
                onCheckedChange={handleToggle}
                disabled={disabled}
            />
        </div>
    )
}
