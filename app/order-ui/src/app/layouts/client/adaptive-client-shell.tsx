import { useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import ClientShell from './client-shell'
import ClientDetailShell from './client-detail-shell'
import { ROUTE } from '@/constants'

/**
 * Component wrapper thông minh để chọn shell phù hợp
 * - Mobile + trang chi tiết: dùng ClientDetailShell (có nút back)
 * - Các trường hợp khác: dùng ClientShell (layout chuẩn)
 */
export default function AdaptiveClientShell() {
    const isMobile = useIsMobile()
    const location = useLocation()

    // Danh sách các route nên dùng detail shell trên mobile
    const detailRoutes = [
        ROUTE.CLIENT_MENU_ITEM, // Chi tiết món
        // Thêm các route khác cần detail layout ở đây
    ]

    // Kiểm tra xem có phải trang chi tiết không
    const isDetailPage = detailRoutes.some(route =>
        location.pathname.startsWith(route.split(':')[0])
    )

    // Trên mobile + trang chi tiết: dùng ClientDetailShell
    if (isMobile && isDetailPage) {
        return <ClientDetailShell />
    }

    // Mặc định: dùng ClientShell
    return <ClientShell />
}

