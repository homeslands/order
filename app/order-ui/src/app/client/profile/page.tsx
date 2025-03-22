import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'

import { ProfilePicture } from '@/components/app/avatar'
import { useUploadProfilePicture } from '@/hooks'
import { useUserStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { showToast } from '@/utils'
import { CustomerProfileTabs } from '@/components/app/tabs'
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui'
import { SendVerifyEmailDialog, UpdateCustomerProfileDialog, UpdatePasswordDialog } from '@/components/app/dialog'

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'toast'])
  const { t: tHelmet } = useTranslation('helmet')
  const { t: tCommon } = useTranslation('common')
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
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.profile.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.profile.title')} />
      </Helmet>
      <div className="flex flex-col items-start gap-10 lg:flex-row">
        {/* ProfilePicture */}
        <div className={`w-full bg-white dark:border flex justify-between rounded-sm shadow-lg lg:w-1/4`}>
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
          <div className='p-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                <UpdateCustomerProfileDialog userProfile={userInfo} />
                <SendVerifyEmailDialog />
                <UpdatePasswordDialog />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Info */}
        <div
          className={`w-full rounded-sm bg-white dark:border px-5 py-4 shadow-lg transition-all duration-300 ease-in-out lg:w-3/4`}
        >
          <CustomerProfileTabs />
        </div>
      </div>
    </div>
  )
}
