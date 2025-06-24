import { Label, Switch } from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface IIsComboSwitchProps {
    defaultValue: boolean
    onChange: (checked: boolean) => void
}

export default function IsComboSwitch({ defaultValue, onChange }: IIsComboSwitchProps) {
    const { t } = useTranslation(['product'])
    return (
        <>
            <div className="flex gap-4 items-center py-2">
                <Label>{t('product.isCombo')}</Label>
                <Switch defaultChecked={defaultValue} onCheckedChange={onChange} />
            </div>
        </>
    )
}
