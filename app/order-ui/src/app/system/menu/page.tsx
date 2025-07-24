import { useIsMobile } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'

export default function SystemMenuPage() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Menu chiếm phần lớn màn hình */}
      <div className={`flex ${isMobile ? 'w-full' : 'w-[75%] xl:w-[70%] pr-6 xl:pr-0'} flex-col gap-2`}>
        <SystemMenuTabs />
      </div>

      {/* CartContent cố định bên phải */}
      {!isMobile && <CartContent />}
    </div>
  )
}
