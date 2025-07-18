import { useIsMobile } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { CartContent } from './components/cart-content'

export default function SystemMenuPage() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Menu chiếm phần lớn màn hình */}
      <div className={`flex ${isMobile ? 'w-full' : 'w-[75%] xl:w-[70%] pr-6 xl:pr-0'} flex-col gap-2`}>
        {/* <div className={`sticky top-4 z-10 bg-white flex flex-row gap-4 items-center ${state === 'expanded' ? 'pr-9 xl:pr-0' : 'pr-2 xl:pr-0'}`}>
          <CurrentDateInput menu={specificMenuResult} />
          <div>

          </div>
        </div> */}

        <SystemMenuTabs />
      </div>

      {/* CartContent cố định bên phải */}
      {!isMobile && <CartContent />}
    </div>
  )
}
