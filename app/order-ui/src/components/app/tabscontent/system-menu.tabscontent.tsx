import { CartDrawer } from '../drawer'
import { CurrentDateInput } from '../input'
import { useUserStore } from '@/stores'
import moment from 'moment'
import { useIsMobile, useSpecificMenu } from '@/hooks'
import SystemMenus from '@/app/system/menu/components/system-menus'

export function SystemMenuTabscontent() {
  const isMobile = useIsMobile()

  const { userInfo } = useUserStore()
  function getCurrentDate() {
    return moment().format('YYYY-MM-DD')
  }
  const { data: specificMenu, isLoading } = useSpecificMenu({
    date: getCurrentDate(),
    branch: userInfo?.branch.slug || '',
  })

  return (
    <div
      className={`flex w-full flex-col pr-2 transition-all duration-300 ease-in-out`}
    >
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-10 flex flex-row items-center gap-2 py-3 pr-4">
        <CurrentDateInput menu={specificMenu?.result} />
        {isMobile && <CartDrawer />}
      </div>

      {/* Scrollable Content Section */}
      <SystemMenus menu={specificMenu?.result} isLoading={isLoading} />
    </div>
  )
}
