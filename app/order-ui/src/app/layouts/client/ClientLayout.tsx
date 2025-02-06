import { Outlet } from 'react-router-dom'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib'
import { DownloadProgress } from '@/components/app/progress'
import { useDownloadStore } from '@/stores'
import { ClientHeader, ClientFooter, BackToTop, BottomBar } from './components'
import { ChooseBranchDialog } from '@/components/app/dialog'
// import MessengerChat from '@/components/messenger/messenger-chat'

export default function ClientLayout() {
  const isMobile = useIsMobile()
  const { progress, fileName, isDownloading } = useDownloadStore()

  return (
    <>
      {/* Header */}
      <ClientHeader />

      {/* Main content */}
      <main className={cn(isMobile ? 'pb-16' : '')}>
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
    </>
  )
}
