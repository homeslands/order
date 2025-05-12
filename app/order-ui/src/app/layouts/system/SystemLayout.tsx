import { Outlet, useLocation } from 'react-router-dom'

import { SidebarProvider, ScrollArea } from '@/components/ui'
import { SystemBreadcrumb } from '@/components/app/breadcrumb'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore, usePaymentMethodStore } from '@/stores'
import { AppHeader, AppSidebar } from './components'
import { useEffect } from 'react'
import { ROUTE } from '@/constants'
import StoreHydrationProvider from './store-hydration-provider'

export default function SystemLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()
  const location = useLocation()
  const { clearStore } = usePaymentMethodStore()

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTE.STAFF_ORDER_PAYMENT)) {
      clearStore()
    }
  }, [location.pathname, clearStore])
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="box-border flex flex-1 min-h-screen">
        <StoreHydrationProvider />
        <AppSidebar />

        {/* Main content */}
        <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden">
          {/* Header - Fixed on mobile */}
          <AppHeader />

          {/* Breadcrumb - Responsive padding */}
          <div className={cn('sticky z-20', isMobile ? 'px-3 py-2' : 'p-4')}>
            <SystemBreadcrumb />
          </div>

          {/* Main scrollable area */}
          <ScrollArea className="flex-1">
            <main
              className={cn(
                'min-h-full',
                isMobile ? 'px-2 pb-[env(safe-area-inset-bottom)]' : 'px-4',
              )}
            >
              <Outlet />
              {isDownloading && (
                <DownloadProgress progress={progress} fileName={fileName} />
              )}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  )
}
