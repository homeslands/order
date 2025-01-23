import { useSpecificMenu } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'
import { CurrentDateInput } from '@/components/app/input'
import { useUserStore } from '@/stores'
import moment from 'moment'

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
    <div className="">
      <div className="flex flex-row items-center gap-2 py-3 pr-4">
        <CurrentDateInput menu={specificMenu?.result} />
      </div>
      <div className="flex flex-row gap-5">
        <div className="w-full lg:w-[70%]">
          <SystemMenuTabs />
        </div>
        <div
          className={`hidden w-0 border-l border-gray-500 pl-2 lg:block lg:w-[30%]`}
        >
          <CartContent />
        </div>
      </div>
    </div>
  )
}
