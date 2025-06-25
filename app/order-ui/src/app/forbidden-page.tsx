import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { ROUTE } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores'

export default function ForbiddenPage() {
    const navigate = useNavigate()
    const { t } = useTranslation('auth')
    const { setLogout, } = useAuthStore()
    const { removeUserInfo } = useUserStore()
    const handleLogout = () => {
        setLogout()
        removeUserInfo()
        navigate(ROUTE.LOGIN)
    }

    const handleGoHome = () => {
        navigate(ROUTE.HOME)
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="space-y-8 w-full max-w-md text-center">
                <div>
                    <h1 className="text-9xl font-extrabold text-destructive">403</h1>
                    <h2 className="mt-4 text-3xl font-bold text-foreground">
                        {t('auth.forbidden.title', 'Truy cập bị từ chối')}
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        {t('auth.forbidden.message', 'Bạn không có quyền truy cập trang này.')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                        {t('auth.logout', 'Đăng xuất')}
                    </Button>

                    <Button onClick={handleGoHome} className="w-full">
                        {t('auth.forbidden.goHome', 'Về trang chủ')}
                    </Button>
                </div>
            </div>
        </div>
    )
} 