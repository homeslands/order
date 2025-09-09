import { Label, Switch } from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface IIsLimitSwitchProps {
  defaultValue: boolean
  onChange: (checked: boolean) => void
}

export default function IsLimitSwitch({ defaultValue, onChange }: IIsLimitSwitchProps) {
  const { t } = useTranslation(['product'])
  return (
    <div className="flex gap-4 justify-between items-center py-2 w-full">
      <Label>{t('product.isLimited')}</Label>
      <Switch defaultChecked={defaultValue} onCheckedChange={onChange} />
    </div>
  )
}
