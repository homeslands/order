import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Coins } from 'lucide-react'

import { ProfilePicture } from '@/components/app/avatar'
import { useUploadProfilePicture } from '@/hooks'
import { useUserStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { formatCurrency, showToast } from '@/utils'
import { CustomerProfileTabs } from '@/components/app/tabs'

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'toast'])
  const { t: tHelmet } = useTranslation('helmet')
  const { t: tGiftCard } = useTranslation(['giftCard'])
  const { userInfo, setUserInfo } = useUserStore()
  const { mutate: uploadProfilePicture } = useUploadProfilePicture()
  const fullname = userInfo?.firstName + ' ' + userInfo?.lastName

  const handleUploadProfilePicture = (file: File) => {
    uploadProfilePicture(file, {
      onSuccess: (data) => {
        showToast(t('toast.uploadProfilePictureSuccess'))
        setUserInfo(data.result)
      },
    })
  }

  return (
    <div className="container py-10 mx-auto">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.profile.title')}</title>
        <meta name="description" content={tHelmet('helmet.profile.title')} />
      </Helmet>
      <div className="flex flex-col gap-10 items-start lg:flex-row">
        {/* Profile picture */}
        <div
          className={`flex flex-col justify-between w-full bg-white rounded-sm shadow-lg dark:border lg:w-1/4`}
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
              <span className="font-bold">{fullname}</span>
              <div className="text-description flex items-center text-[13px]">
                {userInfo?.phonenumber}
              </div>
            </div>      
          </div>          
          <div className="py-4 px-6 bg-gradient-to-r from-orange-100 to-amber-50 ">
            <h3 className="text-[13px] m-0 font-semibold flex items-center gap-3 flex-wrap">
              <Coins className="text-orange-500" />
              <div className="flex flex-row items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">{t('profile.coinBalance')}:</span> 
                <span className="text-[13px] text-orange-500 font-bold tracking-tight">{formatCurrency(123456789, '')}{tGiftCard('giftCard.coin')} </span>
              </div>
            </h3>
          </div>
        </div>
        {/* Info */}
        <div
          className={`px-5 py-4 w-full bg-white rounded-sm shadow-lg transition-all duration-300 ease-in-out dark:border lg:w-3/4`}
        >
          <CustomerProfileTabs />
        </div>
      </div>
    </div>
  )
}
