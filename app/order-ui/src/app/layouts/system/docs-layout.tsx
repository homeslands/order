import { Outlet } from 'react-router-dom'

import { SidebarProvider, ScrollArea } from '@/components/ui'
import { SystemBreadcrumb } from '@/components/app/breadcrumb'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore } from '@/stores'
import { DocsHeader } from './components'
import DocsSidebar from './components/docs-sidebar'

export default function DocsLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="box-border flex flex-1 min-h-screen">
        {/* Main content */}
        <div className="relative flex h-[100dvh] flex-1 flex-col overflow-hidden bg-gray-50">
          {/* Header - Fixed on mobile */}
          <div className="sticky top-0 z-30 border-l-4 border-primary">
            <DocsHeader />
          </div>

          {/* Main scrollable area */}
          <ScrollArea className="flex-1">
            <main
              className={cn(
                'min-h-full flex gap-2',
                isMobile ? 'px-2 pb-[env(safe-area-inset-bottom)]' : 'px-4',
              )}
            >
              <div className='w-1/4 py-4 border-r'>
                <DocsSidebar />
              </div>
              <div className='w-3/4'>
                {/* Breadcrumb - Responsive padding */}
                <div className={cn('sticky z-20', isMobile ? 'px-3 py-2' : 'py-4')}>
                  <SystemBreadcrumb />
                </div>
                <Outlet />
              </div>
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
