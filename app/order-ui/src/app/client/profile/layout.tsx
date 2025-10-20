import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Coins, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'

import { ProfilePicture } from '@/components/app/avatar'
import { useUploadProfilePicture, useGetUserBalance, useLoyaltyPoints, useIsMobile } from '@/hooks'
import { useUserStore } from '@/stores'
import { publicFileURL, ROUTE } from '@/constants'
import { formatCurrency, formatPoints, showToast } from '@/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
export default function ProfileLayout() {
    const isMobile = useIsMobile()
    const location = useLocation()
    const { t } = useTranslation(['profile', 'toast'])
    const { t: tLoyaltyPoint } = useTranslation('loyaltyPoint')
    const { t: tHelmet } = useTranslation('helmet')
    const { userInfo, setUserInfo } = useUserStore()
    const { data: pointsData } = useLoyaltyPoints(userInfo?.slug ?? '')
    const { mutate: uploadProfilePicture } = useUploadProfilePicture()
    const fullname = userInfo?.firstName + ' ' + userInfo?.lastName
    const [showBalance, setShowBalance] = useState(true)

    const { data: balanceData } = useGetUserBalance(userInfo?.slug)
    const balance = balanceData?.result?.points || 0
    const points = pointsData?.totalPoints || 0

    // Lấy current tab từ pathname
    const pathParts = location.pathname.split('/')
    const currentTab = pathParts[pathParts.length - 1] === 'profile' ? '' : pathParts[pathParts.length - 1]

    const handleUploadProfilePicture = (file: File) => {
        uploadProfilePicture(file, {
            onSuccess: (data) => {
                showToast(t('toast.uploadProfilePictureSuccess'))
                setUserInfo(data.result)
            },
        })
    }

    const toggleBalanceVisibility = () => {
        setShowBalance(!showBalance)
    }

    return (
        <div className="container py-10 mx-auto">
            <Helmet>
                <meta charSet="utf-8" />
                <title>{tHelmet('helmet.profile.title')}</title>
                <meta name="description" content={tHelmet('helmet.profile.title')} />
            </Helmet>

            <div className="flex flex-col gap-6 items-start lg:flex-row">
                {/* Profile picture - Always show */}
                <div className='flex flex-col gap-2 w-full lg:w-1/4'>
                    <div
                        className={`flex flex-col justify-between w-full bg-white rounded-sm dark:border dark:bg-muted-foreground/10`}
                    >
                        <div className="flex flex-row p-4">
                            <ProfilePicture
                                height={70}
                                width={70}
                                src={
                                    userInfo?.image
                                        ? `${publicFileURL}/${userInfo?.image}`
                                        : 'https://github.com/shadcn.png'
                                }
                                onUpload={handleUploadProfilePicture}
                            />
                            <div className="flex flex-col justify-center ml-4">
                                <span className="font-bold dark:text-white">{fullname}</span>
                                <div className="text-description flex items-center text-[13px] dark:text-gray-300">
                                    {userInfo?.phonenumber}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-900/40 dark:to-amber-800/30">
                            <h3 className="m-0 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
                                <div className="flex flex-row gap-2 items-center">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {t('profile.coinBalance')}:
                                    </span>
                                    <span className="text-[13px] font-bold tracking-tight text-primary dark:text-orange-300">
                                        {showBalance ? formatCurrency(balance, '') : '••••••••'}
                                    </span>
                                    {showBalance && (
                                        <Coins className="text-primary dark:text-orange-300" />
                                    )}
                                    <button
                                        onClick={toggleBalanceVisibility}
                                        className="ml-1 transition-colors text-primary hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        aria-label={
                                            showBalance
                                                ? t('profile.hideBalance')
                                                : t('profile.showBalance')
                                        }
                                    >
                                        {showBalance ? (
                                            <EyeOffIcon className="w-4 h-4 text-primary" />
                                        ) : (
                                            <EyeIcon className="w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                </div>
                            </h3>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-900/40 dark:to-amber-800/30">
                        <span className="text-[13px] tracking-tight">
                            {t('profile.points.points')}: <span className="text-primary dark:text-orange-300">{formatPoints(points)} {' '} ({tLoyaltyPoint('loyaltyPoint.pointWithCurrency', { points: formatPoints(points) })})</span>
                        </span>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex flex-col gap-6 w-full lg:w-3/4">
                    {/* Mobile: Show back button if not on overview */}
                    {/* {isMobile && currentTab && (
                        <Button
                            variant="ghost"
                            className="flex gap-2 items-center self-start"
                            asChild
                        >
                            <Link to={ROUTE.CLIENT_PROFILE}>
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span>{t('profile.backToMenu')}</span>
                            </Link>
                        </Button>
                    )} */}

                    {/* Desktop: Show tabs */}
                    {!isMobile && (
                        <Tabs value={currentTab || 'info'} className="w-full">
                            <TabsList className="scrollbar-hide mb-6 flex h-full w-full !justify-start gap-3 overflow-x-auto lg:mb-0">
                                <TabsTrigger
                                    value="info"
                                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3"
                                    asChild
                                >
                                    <Link to={ROUTE.CLIENT_PROFILE_INFO}>
                                        {t('profile.generalInfo')}
                                    </Link>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                                    asChild
                                >
                                    <Link to={ROUTE.CLIENT_PROFILE_HISTORY}>
                                        {t('profile.history')}
                                    </Link>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="loyalty-point"
                                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                                    asChild
                                >
                                    <Link to={ROUTE.CLIENT_PROFILE_LOYALTY_POINT}>
                                        {t('profile.loyaltyPoints')}
                                    </Link>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="coin"
                                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                                    asChild
                                >
                                    <Link to={ROUTE.CLIENT_PROFILE_COIN}>
                                        {t('profile.coin')}
                                    </Link>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="gift-card"
                                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                                    asChild
                                >
                                    <Link to={ROUTE.CLIENT_PROFILE_GIFT_CARD}>
                                        {t('profile.giftCard.defaultTitle')}
                                    </Link>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {/* Render child routes */}
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

