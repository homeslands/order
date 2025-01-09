import moment from 'moment'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ISpecificMenu } from '@/types'

interface CurrentDateInputProps {
  menu?: ISpecificMenu
}

export const CurrentDateInput = ({ menu }: CurrentDateInputProps) => {
  const { t } = useTranslation('common')

  const currentDate = moment(new Date()).format('DD/MM/YYYY')
  const dayOfWeek = menu?.dayIndex !== undefined ? t(`dayOfWeek.${menu.dayIndex}`) : ''

  return (
    <div className="flex w-full items-end justify-start gap-1 rounded-sm py-2 text-[14px] text-muted-foreground">
      <Calendar />
      <span>
        {dayOfWeek} {currentDate}
      </span>
    </div>
  )
}

export default CurrentDateInput
