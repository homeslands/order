import { Outlet, useLocation } from 'react-router-dom'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore, usePaymentMethodStore } from '@/stores'
import { ClientHeader, ClientFooter, BackToTop, BottomBar } from './components'
import { ChooseBranchDialog } from '@/components/app/dialog'
import { useEffect } from 'react'
import { ROUTE } from '@/constants'

export default function ClientLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()
  const location = useLocation()
  const { clearStore } = usePaymentMethodStore()

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTE.CLIENT_PAYMENT)) {
      clearStore()
    }
  }, [location.pathname, clearStore])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <ClientHeader />

      {/* Main content */}
      <main className={cn('flex-grow', isMobile ? 'pb-16' : '')}>
        <ChooseBranchDialog />
        <Outlet />
        {isDownloading && (
          <DownloadProgress progress={progress} fileName={fileName} />
        )}
        {/* <MessengerChat /> */}
        <BackToTop />
      </main>

      {/* Footer */}
      {isMobile && <BottomBar />}
      <ClientFooter />
    </div>
  )
}
