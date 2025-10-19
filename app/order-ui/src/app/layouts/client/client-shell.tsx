import { Outlet } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { ClientHeader, ClientFooter, BackToTop, BottomBarStatic } from './components'

export default function ClientShell() {
    const isMobile = useIsMobile()

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <ClientHeader />

            {/* Nội dung chính (Outlet cho ClientLayout) */}
            <div className="flex-grow">
                <Outlet />
            </div>

            {/* Footer */}
            <ClientFooter />

            {/* Back to top button */}
            <BackToTop />

            {/* Bottom bar - floating on mobile */}
            {isMobile && <BottomBarStatic />}
        </div>
    )
}
