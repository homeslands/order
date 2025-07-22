import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useCartItemStore, useDownloadStore, usePaymentMethodStore, useUserStore } from '@/stores'
import { ClientHeader, ClientFooter, BackToTop, BottomBar } from './components'
import { Role, ROUTE } from '@/constants'
import { useTables } from '@/hooks'

export default function PublicClientLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()
  const location = useLocation()
  const { clearStore } = usePaymentMethodStore()
  const { userInfo } = useUserStore();
  const navigate = useNavigate()
  const { addTable } = useCartItemStore()

  const [searchParams] = useSearchParams()
  const branchSlug = searchParams.get('branch') || undefined
  const tableSlug = searchParams.get('table')
  const { data: tableRes } = useTables(branchSlug)

  useEffect(() => {
    if (tableSlug && tableRes?.result && tableRes.result.length > 0) {
      const table = tableRes.result.find((item) => item.slug === tableSlug)
      if (table) {
        addTable(table)
      }
    }
  }, [tableSlug, addTable, tableRes])

  useEffect(() => {
    // Don't clear payment store when on any payment page (client or staff)
    const isOnPaymentPage = location.pathname.startsWith(ROUTE.CLIENT_PAYMENT) ||
      location.pathname.startsWith(ROUTE.STAFF_ORDER_PAYMENT)

    if (!isOnPaymentPage) {
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
