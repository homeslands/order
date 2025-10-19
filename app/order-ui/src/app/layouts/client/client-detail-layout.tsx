import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

import { cn } from '@/lib'
import { useCartItemStore, useDownloadStore, usePaymentMethodStore, useUserStore } from '@/stores'
import { DownloadProgress } from '@/components/app/progress'
import { ChooseBranchDialog } from '@/components/app/dialog'
import { Role, ROUTE } from '@/constants'
import { useTables } from '@/hooks'

export default function ClientDetailLayout() {
  const { progress, fileName, isDownloading } = useDownloadStore()
  const { addTable } = useCartItemStore()
  const { clearStore } = usePaymentMethodStore()
  const { userInfo } = useUserStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const branchSlug = searchParams.get('branch') || undefined
  const tableSlug = searchParams.get('table')
  const { data: tableRes } = useTables(branchSlug)

  useEffect(() => {
    if (tableSlug && tableRes?.result) {
      const table = tableRes?.result.find((item) => item.slug === tableSlug)
      if (table) addTable(table)
    }
  }, [tableSlug, tableRes, addTable])

  useEffect(() => {
    const isOnPaymentPage =
      location.pathname.startsWith(ROUTE.CLIENT_PAYMENT) ||
      location.pathname.startsWith(ROUTE.STAFF_ORDER_PAYMENT)

    if (!isOnPaymentPage) clearStore()

    if (userInfo && userInfo.role?.name !== Role.CUSTOMER) {
      navigate(ROUTE.LOGIN)
    }
  }, [location.pathname, clearStore, userInfo, navigate])

  return (
    <main className={cn('flex-grow bg-muted-foreground/10')}>
      <ChooseBranchDialog />
      <Outlet />
      {isDownloading && <DownloadProgress progress={progress} fileName={fileName} />}
    </main>
  )
}
