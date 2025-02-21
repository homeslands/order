import moment from 'moment'

import { useSpecificMenu } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'
import { CurrentDateInput } from '@/components/app/input'
import { useUserStore } from '@/stores'

export default function SystemMenuPage() {
  const { userInfo } = useUserStore()
  function getCurrentDate() {
    return moment().format('YYYY-MM-DD')
  }
  const { data: specificMenu } = useSpecificMenu({
    date: getCurrentDate(),
    branch: userInfo?.branch.slug || '',
  })

  return (
    <div className="flex h-screen">
      {/* Menu chiếm phần lớn màn hình */}
      <div className="flex w-[70%] flex-col gap-2 py-3">
        <CurrentDateInput menu={specificMenu?.result} />
        <SystemMenuTabs />
      </div>

      {/* CartContent cố định bên phải */}
      <div className={`fixed right-0 top-14 h-screen w-[25%] shadow-md`}>
        <CartContent />
      </div>
    </div>
  )
}
