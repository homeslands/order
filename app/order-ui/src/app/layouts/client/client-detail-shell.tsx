import { Outlet } from 'react-router-dom'
import { ClientFooter, BackToTop, ClientDetailHeader } from './components'

export default function ClientDetailShell() {
    // const isMobile = useIsMobile()

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <ClientDetailHeader />

            {/* Nội dung chính (Outlet cho ClientLayout) */}
            <div className="flex-grow">
                <Outlet />
            </div>

            {/* Footer */}
            <ClientFooter />

            {/* Back to top button */}
            <BackToTop />

            {/* Bottom bar - floating on mobile */}
            {/* {isMobile && <BottomBar />} */}
        </div>
    )
}
