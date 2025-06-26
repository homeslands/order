import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Coins } from 'lucide-react'

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

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.profile.title')}</title>
        <meta name="description" content={tHelmet('helmet.profile.title')} />
      </Helmet>
      <div className="flex flex-col items-start gap-10 lg:flex-row">
        {/* Profile picture */}
        <div
          className={`flex w-full flex-col justify-between rounded-sm bg-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 lg:w-1/4`}
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
            <div className="ml-4 flex flex-col justify-center">
              <span className="font-bold dark:text-white">{fullname}</span>
              <div className="text-description flex items-center text-[13px] dark:text-gray-300">
                {userInfo?.phonenumber}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-amber-50 px-6 py-4 dark:from-orange-900/40 dark:to-amber-800/30">
            <h3 className="m-0 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
              <div className="flex flex-row items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">
                  {t('profile.coinBalance')}:
                </span>
                <span className="text-[13px] font-bold tracking-tight text-orange-500 dark:text-orange-300">
                  {formatCurrency(balance, '')}
                </span>
                <Coins className="text-orange-500 dark:text-orange-300" />
              </div>
            </h3>
          </div>
        </div>
        {/* Info */}
        <div
          className={`w-full rounded-sm bg-white px-5 py-4 shadow-lg transition-all duration-300 ease-in-out dark:border dark:border-gray-700 dark:bg-gray-800 lg:w-3/4`}
        >
          <CustomerProfileTabs />
        </div>
      </div>
    </div>
  )
}
