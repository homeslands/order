import { Outlet } from 'react-router-dom'
import { ClientFooter, BackToTop, ClientProfileHeader } from './components'

export default function ClientProfileShell() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header - No Cart */}
            <ClientProfileHeader />

            {/* Nội dung chính (Outlet cho ClientLayout) */}
            <div className="flex-grow">
                <Outlet />
            </div>

            {/* Footer */}
            <ClientFooter />

            {/* Back to top button */}
            <BackToTop />
        </div>
    )
}

