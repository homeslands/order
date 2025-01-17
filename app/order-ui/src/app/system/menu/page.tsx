import { useIsMobile } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'

export default function SystemMenuPage() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-row gap-5">
      <div className="w-full lg:w-[70%]">
        <SystemMenuTabs />
      </div>
      <div className={`w-0 border-l border-gray-500 pl-2 lg:w-[30%]`}>
        {!isMobile && <CartContent />}
      </div>
    </div>
  )
}
