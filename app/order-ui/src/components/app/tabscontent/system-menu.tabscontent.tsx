import moment from 'moment'

import { useUserStore } from '@/stores'
import { useSpecificMenu } from '@/hooks'
import SystemMenus from '@/app/system/menu/components/system-menus'

export function SystemMenuTabscontent() {
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
      className={`flex w-full flex-col`}
    >
      <SystemMenus menu={specificMenu?.result} isLoading={isLoading} />
    </div>
  )
}
