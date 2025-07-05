import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Coins, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'

import { ProfilePicture } from '@/components/app/avatar'
import { useUploadProfilePicture, useGetUserBalance } from '@/hooks'
import { useUserStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { formatCurrency, showToast } from '@/utils'
import { CustomerProfileTabs } from '@/components/app/tabs'

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'toast'])
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo, setUserInfo } = useUserStore()
  const { mutate: uploadProfilePicture } = useUploadProfilePicture()
  const fullname = userInfo?.firstName + ' ' + userInfo?.lastName
  const [showBalance, setShowBalance] = useState(true)

  const { data: balanceData } = useGetUserBalance(userInfo?.slug)
  const balance = balanceData?.result?.points || 0

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
      <div className="flex flex-col items-start gap-10 lg:flex-row">
        {/* Profile picture */}
        <div
          className={`flex flex-col justify-between w-full bg-white rounded-sm shadow-lg dark:border dark:bg-transparent lg:w-1/4`}
        >
          <div className="flex flex-row p-2">
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
              <div className="flex flex-row items-center gap-2">
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
                  className="text-primary hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ml-1"
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
        {/* Info */}
        <div
          className={`px-5 py-4 w-full bg-white rounded-sm shadow-lg transition-all duration-300 ease-in-out dark:bg-transparent dark:border lg:w-3/4`}
        >
          <CustomerProfileTabs />
        </div>
      </div>
    </div>
  )
}
