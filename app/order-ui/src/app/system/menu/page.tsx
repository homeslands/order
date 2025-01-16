import { CartContent } from '@/router/loadable'
import { useIsMobile } from '@/hooks'
import { SystemMenuTabs } from '@/components/app/tabs'
import { cn } from '@/lib'

export default function SystemMenuPage() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-row gap-2">
      <div className={cn(isMobile ? 'w-full' : 'w-[72%]')}>
        <SystemMenuTabs />
      </div>
      <div
        className={`fixed right-0 h-[calc(100vh-6.5rem)] bg-background transition-all duration-300 ease-in-out ${
          !isMobile ? 'w-[25%]' : 'w-0 opacity-0'
        }`}
      >
        {!isMobile && <CartContent />}
      </div>
    </div>
  )
}
