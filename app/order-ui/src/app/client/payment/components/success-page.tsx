import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { OrderSuccess } from '@/assets/images'
import { Button } from '@/components/ui'
import { Role, ROUTE } from '@/constants'
import { useUserStore } from '@/stores'
import { useEffect } from 'react'

export default function ClientOrderSuccessPage() {
    const { t } = useTranslation('menu')
    const { userInfo } = useUserStore()
    const { slug } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        const timer = setTimeout(() => {
        }, 300)

        return () => clearTimeout(timer)
    }, [])

    const handleViewDetail = () => {
        if (userInfo && userInfo?.role.name === Role.CUSTOMER) {
            navigate(`${ROUTE.CLIENT_ORDER_HISTORY}?order=${slug}`)
        } else {
            navigate(`${ROUTE.CLIENT_ORDERS_PUBLIC}/${slug}`)
        }
    }

    const handleBackToMenu = () => {
        if (userInfo && userInfo?.role.name === Role.CUSTOMER) {
            navigate(ROUTE.CLIENT_MENU)
        } else {
            navigate(ROUTE.CLIENT_MENU)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-200px)] gap-4">
            <img src={OrderSuccess} className="w-48 h-48 sm:object-fill" />
            <div className="text-xl font-semibold text-primary">
                {t('order.orderSuccess')}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleViewDetail}>
                    {t('order.viewDetail')}
                </Button>
                <Button onClick={handleBackToMenu}>
                    {t('order.backToMenu')}
                </Button>
            </div>
        </div>
    )
}
