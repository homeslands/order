import moment from 'moment'

import { useIsMobile, useSpecificMenu } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'
import { CurrentDateInput } from '@/components/app/input'
import { useUserStore } from '@/stores'

export default function SystemMenuPage() {
  const { userInfo } = useUserStore()
  const isMobile = useIsMobile()
  function getCurrentDate() {
    return moment().format('YYYY-MM-DD')
  }
  const { data: specificMenu } = useSpecificMenu({
    date: getCurrentDate(),
    branch: userInfo?.branch?.slug || '',
  })

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Menu chiếm phần lớn màn hình */}
      <div className={`flex ${isMobile ? 'w-full' : 'w-[75%] xl:w-[70%] pr-4 xl:pr-0'} flex-col gap-2 py-3`}>
        <div className='flex gap-4 items-center'>
          <CurrentDateInput menu={specificMenu?.result} />
          {/* {!isMobile && <CartContentSheet />} */}
        </div>
        <SystemMenuTabs />
      </div>

      {/* CartContent cố định bên phải */}
      {!isMobile && <CartContent />}
    </div>
  )
}
