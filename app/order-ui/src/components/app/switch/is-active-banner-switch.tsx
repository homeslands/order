import { useTranslation } from 'react-i18next'

import { Label, Switch } from '@/components/ui'

interface IIsActiveBannerSwitchProps {
    defaultValue: boolean
    onChange: (checked: boolean) => void
}

export default function IsActiveBannerSwitch({ defaultValue, onChange }: IIsActiveBannerSwitchProps) {
    const { t } = useTranslation(['banner'])
    return (
        <>
            <div className="flex items-center gap-4 py-2">
                <Label>{t('banner.isActive')}</Label>
                <Switch defaultChecked={defaultValue} onCheckedChange={onChange} />
            </div>
        </>
    )
}
