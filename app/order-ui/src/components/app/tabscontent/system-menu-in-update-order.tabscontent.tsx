import moment from 'moment'

import { useUserStore } from '@/stores'
import { useSpecificMenu } from '@/hooks'
import SystemMenusInUpdateOrder from '@/app/system/menu/components/system-menus-in-update-order'

interface SystemMenuInUpdateOrderTabscontentProps {
  onSuccess: () => void
}

export function SystemMenuInUpdateOrderTabscontent({ onSuccess }: SystemMenuInUpdateOrderTabscontentProps) {
  const { userInfo } = useUserStore()
  function getCurrentDate() {
    return moment().format('YYYY-MM-DD')
  }
  const { data: specificMenu, isLoading } = useSpecificMenu({
    date: getCurrentDate(),
    branch: userInfo?.branch?.slug || '',
  })

  return (
    <div
      className={`flex flex-col w-full`}
    >
      <SystemMenusInUpdateOrder menu={specificMenu?.result} isLoading={isLoading} onSuccess={onSuccess} />
    </div>
  )
}
