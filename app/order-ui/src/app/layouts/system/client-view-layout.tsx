import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { ScrollArea } from '@/components/ui'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { usePaymentMethodStore } from '@/stores'
import { ClientViewHeader } from './components'
import { ROUTE } from '@/constants'

export default function ClientViewLayout() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const { clearStore } = usePaymentMethodStore()

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTE.STAFF_ORDER_PAYMENT)) {
      clearStore()
    }
  }, [location.pathname, clearStore])
  return (
    <div className="box-border flex flex-1 min-h-screen">

      {/* Main content */}
      <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden">
        {/* Header - Fixed on mobile */}
        <ClientViewHeader />

        {/* Main scrollable area */}
        <ScrollArea className="flex-1">
          <main
            className={cn(
              'min-h-full',
              isMobile ? 'px-2 pb-[env(safe-area-inset-bottom)]' : 'px-4',
            )}
          >
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
