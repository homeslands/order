import { useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import ClientShell from './client-shell'
import ClientDetailShell from './client-detail-shell'
import ClientProfileShell from './client-profile-shell'
import { ROUTE } from '@/constants'

/**
 * Component wrapper thông minh để chọn shell phù hợp
 * - Mobile + trang chi tiết sản phẩm: dùng ClientDetailShell (có nút back + cart)
 * - Mobile + trang profile: dùng ClientProfileShell (có nút back, không có cart)
 * - Các trường hợp khác: dùng ClientShell (layout chuẩn)
 */
export default function AdaptiveClientShell() {
    const isMobile = useIsMobile()
    const location = useLocation()

    // Danh sách các route dùng detail shell (có cart)
    const detailRoutesWithCart = [
        ROUTE.CLIENT_MENU_ITEM, // Chi tiết món
    ]

    // Danh sách các route dùng profile shell (không có cart)
    const profileRoutes = [
        ROUTE.CLIENT_PROFILE, // Trang profile
    ]

    // Kiểm tra xem có phải trang chi tiết sản phẩm không
    const isDetailPageWithCart = detailRoutesWithCart.some(route =>
        location.pathname.startsWith(route.split(':')[0])
    )

    // Kiểm tra xem có phải trang profile không
    const isProfilePage = profileRoutes.some(route =>
        location.pathname.startsWith(route.split(':')[0])
    )

    // Trên mobile + trang chi tiết sản phẩm: dùng ClientDetailShell
    if (isMobile && isDetailPageWithCart) {
        return <ClientDetailShell />
    }

    // Trên mobile + trang profile: dùng ClientProfileShell
    if (isMobile && isProfilePage) {
        return <ClientProfileShell />
    }

    // Mặc định: dùng ClientShell
    return <ClientShell />
}

