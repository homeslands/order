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
      <div className={`flex ${isMobile ? 'w-full' : 'w-[70%]'} flex-col gap-2 py-3`}>
        <div className='flex items-center justify-betweens'>
          <CurrentDateInput menu={specificMenu?.result} />
          {/* {!isMobile && <CartContentSheet />} */}
        </div>
        <SystemMenuTabs />
      </div>


      {/* CartContent cố định bên phải */}
      {!isMobile && <div className={`fixed right-0 top-14 h-screen w-[25%] shadow-md`}>
        <CartContent />
      </div>}
    </div>
  )
}
