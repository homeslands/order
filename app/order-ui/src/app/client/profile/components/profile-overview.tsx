import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { ChevronRightIcon, Coins, GiftIcon, Inbox, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { ROUTE } from '@/constants'
import { useIsMobile } from '@/hooks'
import { useEffect, useState } from 'react'

export default function ProfileOverview() {
    const { t } = useTranslation(['profile'])
    const isMobile = useIsMobile()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Wait for hook to initialize
    if (!mounted) {
        return null
    }

    // Desktop: Redirect to first tab
    if (!isMobile) {
        return <Navigate to={ROUTE.CLIENT_PROFILE_INFO} replace />
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Account and Security */}
            <div className="flex flex-col gap-2">
                <span className="pl-3 text-sm font-semibold text-muted-foreground">
                    {t('profile.accountAndSecurity')}
                </span>
                <div
                    className={`flex flex-col gap-2 px-2 py-4 w-full bg-white rounded-2xl border shadow-sm transition-all duration-300 ease-in-out border-muted-foreground/10 dark:bg-muted-foreground/10 dark:border`}
                >
                    <Link to={`${ROUTE.CLIENT_PROFILE_INFO}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-2 pl-1">
                                    <span className="text-[15px] font-medium">{t('profile.generalInfo')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Order history */}
            <div className="flex flex-col gap-2">
                <span className="pl-3 text-sm font-semibold text-muted-foreground">
                    {t('profile.orderHistory')}
                </span>
                <div
                    className={`flex flex-col gap-2 px-2 py-4 w-full bg-white rounded-2xl border shadow-sm transition-all duration-300 ease-in-out border-muted-foreground/10 dark:bg-muted-foreground/10 dark:border`}
                >
                    {/* Item 1: Lịch sử đơn hàng */}
                    <Link to={`${ROUTE.CLIENT_PROFILE_HISTORY}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Inbox className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-2 pl-1 border-b border-muted-foreground/10">
                                    <span className="text-[15px] font-medium">{t('profile.history')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>

                    {/* Item 2: Thẻ quà tặng */}
                    <Link to={`${ROUTE.CLIENT_PROFILE_GIFT_CARD}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <GiftIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-2 pl-1 border-b border-muted-foreground/10">
                                    <span className="text-[15px] font-medium">{t('profile.giftCard.defaultTitle')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>

                    {/* Item 3: Quản lý xu */}
                    <Link to={`${ROUTE.CLIENT_PROFILE_COIN}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Coins className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-2 pl-1">
                                    <span className="text-[15px] font-medium">{t('profile.coin')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Member and Promotion */}
            <div className="flex flex-col gap-2">
                <span className="pl-3 text-sm font-semibold text-muted-foreground">
                    {t('profile.memberAndPromotion')}
                </span>

                <div
                    className={`flex flex-col gap-2 px-2 py-4 w-full bg-white rounded-2xl border shadow-sm transition-all duration-300 ease-in-out border-muted-foreground/10 dark:bg-muted-foreground/10 dark:border`}
                >
                    {/* Item 1 */}
                    <Link to={`${ROUTE.CLIENT_PROFILE_LOYALTY_POINT}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <GiftIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-3 pl-1 border-b border-muted-foreground/10">
                                    <span className="text-[15px] font-medium">{t('profile.loyaltyPoints')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>

                    {/* Item 2 */}
                    <Link to={`${ROUTE.CLIENT_PROFILE_COIN}`}>
                        <Button variant="ghost" className="flex justify-between px-0 w-full rounded-none">
                            <div className="flex gap-3 items-center w-full">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Coins className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-1 justify-between items-center py-2 pl-1">
                                    <span className="text-[15px] font-medium">{t('profile.coin')}</span>
                                    <ChevronRightIcon className="icon text-muted-foreground" />
                                </div>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

