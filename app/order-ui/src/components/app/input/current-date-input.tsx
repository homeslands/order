import moment from 'moment'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ISpecificMenu } from '@/types'
import { useUserStore } from '@/stores'
import { Badge } from '@/components/ui'
import { useIsMobile } from '@/hooks'

interface CurrentDateInputProps {
  menu?: ISpecificMenu
}

export const CurrentDateInput = ({ menu }: CurrentDateInputProps) => {
  const { t } = useTranslation('common')
  const { userInfo } = useUserStore()
  const isMobile = useIsMobile()
  const currentDate = moment(new Date()).format('DD/MM/YYYY')
  const dayOfWeek = menu?.dayIndex !== undefined ? t(`dayOfWeek.${menu.dayIndex}`) : ''

  return (
    <div className={`flex gap-2 w-full ${isMobile ? 'flex-col justify-start items-start' : 'justify-between items-center'}`}>

      <div className="flex w-48 items-center justify-start gap-1 rounded-sm py-2 text-[14px] text-muted-foreground">
        <Calendar />
        <span>
          {dayOfWeek} {currentDate}
        </span>
      </div>
      <Badge className='py-2 text-sm'>
        {userInfo?.branch?.name} - {userInfo?.branch?.address}
      </Badge>
    </div>
  )
}

export default CurrentDateInput
