import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui'

interface PeriodOfTimeSelectProps {
    periodOfTime?: string
    onChange?: (timeRange: string) => void
}

export default function PeriodOfTimeSelect({ periodOfTime, onChange }: PeriodOfTimeSelectProps) {
    const { t } = useTranslation(['common'])
    const [selectedTime, setSelectedTime] = useState<string>(periodOfTime || 'today')

    // Cập nhật state khi props periodOfTime thay đổi
    useEffect(() => {
        if (periodOfTime) {
            setSelectedTime(periodOfTime)
        }
    }, [periodOfTime])

    useEffect(() => {
        if (onChange) {
            onChange(selectedTime)
        }
    }, [selectedTime, onChange])

    return (
        <Select onValueChange={setSelectedTime} value={selectedTime}>
            <SelectTrigger className="w-fit gap-1 outline-none">
                <SelectValue placeholder={t('dayOfWeek.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value='today'>{t('dayOfWeek.today')}</SelectItem>
                    <SelectItem value='inWeek'>{t('dayOfWeek.inWeek')}</SelectItem>
                    <SelectItem value='inMonth'>{t('dayOfWeek.inMonth')}</SelectItem>
                    <SelectItem value='inYear'>{t('dayOfWeek.inYear')}</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
