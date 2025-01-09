import { Outlet } from 'react-router-dom'

import { SidebarProvider, ScrollArea } from '@/components/ui'
import { AppSidebar, AppHeader } from '@/components/app'
import { BreadcrumbComponent } from '@/components/app/breadcrumb'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore } from '@/stores'

export default function StaffLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="box-border flex flex-1 min-h-screen">
        {/* Sidebar - Hidden on mobile by default */}
        <AppSidebar />

        {/* Main content */}
        <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden bg-gray-50">
          {/* Header - Fixed on mobile */}
          <div className="sticky top-0 z-30 border-l-4 border-primary">
            <AppHeader />
          </div>

          {/* Breadcrumb - Responsive padding */}
          <div className={cn('sticky z-20', isMobile ? 'px-3 py-2' : 'p-4')}>
            <BreadcrumbComponent />
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
