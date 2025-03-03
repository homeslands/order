import { Label, Switch } from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface IIsTopSaleSwitchProps {
    defaultValue: boolean
    onChange: (checked: boolean) => void
}

export default function IsTopSaleSwitch({ defaultValue, onChange }: IIsTopSaleSwitchProps) {
    const { t } = useTranslation(['product'])
    return (
        <>
            <div className="flex items-center gap-4 py-2">
                <Label>{t('product.isTopSell')}</Label>
                <Switch defaultChecked={defaultValue} onCheckedChange={onChange} />
            </div>
        </>
    )
}
