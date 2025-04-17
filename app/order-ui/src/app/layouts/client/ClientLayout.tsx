import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore, usePaymentMethodStore, useUserStore } from '@/stores'
import { ClientHeader, ClientFooter, BackToTop, BottomBar } from './components'
import { ChooseBranchDialog } from '@/components/app/dialog'
import { Role, ROUTE } from '@/constants'

export default function ClientLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()
  const location = useLocation()
  const { clearStore } = usePaymentMethodStore()
  const { userInfo } = useUserStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTE.CLIENT_PAYMENT)) {
      clearStore()
    }
    if (userInfo && userInfo.role.name !== Role.CUSTOMER) {
      navigate(ROUTE.LOGIN)
    }
  }, [location.pathname, clearStore, userInfo, navigate])

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
