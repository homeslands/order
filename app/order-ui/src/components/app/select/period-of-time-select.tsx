
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface PeriodOfTimeSelectProps {
    onChange?: (timeRange: string) => void
}

export default function PeriodOfTimeSelect({ onChange }: PeriodOfTimeSelectProps) {
    const { t } = useTranslation(['common'])

    const handleSelectTimeRange = (timeRange: string) => {
        if (onChange) {
            onChange(timeRange)
        }
    }

    return (
        <Select onValueChange={handleSelectTimeRange} defaultValue='today'>
            <SelectTrigger className="w-fit gap-1 outline-none ">
                <SelectValue placeholder={t('dayOfWeek.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {/* <SelectLabel></SelectLabel> */}
                    <SelectItem value='today'>
                        {t('dayOfWeek.today')}
                    </SelectItem>
                    <SelectItem value='inWeek'>
                        {t('dayOfWeek.inWeek')}
                    </SelectItem>
                    <SelectItem value='inMonth'>
                        {t('dayOfWeek.inMonth')}
                    </SelectItem>
                    <SelectItem value='inYear'>
                        {t('dayOfWeek.inYear')}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
