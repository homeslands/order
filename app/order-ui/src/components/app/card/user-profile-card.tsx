import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'

import { Input, Card, CardContent, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, Button } from '@/components/ui'
import { ProfilePicture } from '@/components/app/avatar'
import { useProfile, useUploadProfilePicture } from '@/hooks'
import { publicFileURL } from '@/constants'
import {
  SendVerifyEmailDialog,
  UpdatePasswordDialog,
  UpdateProfileDialog,
} from '@/components/app/dialog'
import { showToast } from '@/utils'
import { useUserStore } from '@/stores'

export default function UserProfileCard() {
  const { t } = useTranslation(['profile', 'toast'])
  const { t: tCommon } = useTranslation('common')
  const { data } = useProfile()
  const { userInfo, setUserInfo } = useUserStore()
  const { mutate: uploadProfilePicture } = useUploadProfilePicture()

  const handleUploadProfilePicture = (file: File) => {
    uploadProfilePicture(file, {
      onSuccess: (data) => {
        showToast(t('toast.uploadProfilePictureSuccess'))
        setUserInfo(data.result)
      },
    })
  }

  const userProfile = data?.result
  const formFields = {
    firstName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.firstName')}</span>
        <Input className="" value={userProfile?.firstName} readOnly />
      </div>
    ),
    lastName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.lastName')}</span>
        <Input className="" value={userProfile?.lastName} readOnly />
      </div>
    ),
    email: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.email')}</span>
        <Input className="" value={userProfile?.email} readOnly />
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.phoneNumber')}</span>
        <Input className="" value={userProfile?.phonenumber} readOnly />
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.dob')}</span>
        <Input className="" value={userProfile?.dob} readOnly />
      </div>
    ),
    address: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.address')}</span>
        <Input className="" value={userProfile?.address} readOnly />
      </div>
    ),
    branch: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.branch')}</span>
        <Input className="" value={userProfile?.branch?.name} readOnly />
      </div>
    ),
  }
  return (
    <div>
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="flex flex-col gap-6 p-0">
          <div className="flex flex-row justify-between p-4 bg-white border rounded-md">
            <div className='flex items-center'>
              <ProfilePicture
                height={80}
                width={80}
                src={
                  userProfile?.image
                    ? `${publicFileURL}/${userInfo?.image}`
                    : 'https://github.com/shadcn.png'
                }
                onUpload={handleUploadProfilePicture}
              />
              <div className="flex flex-col justify-center ml-4">
                <span className="font-bold text-md">
                  {userProfile?.lastName} {userProfile?.firstName}
                </span>
                <div className="flex items-center text-description"></div>
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
                  <UpdateProfileDialog userProfile={userProfile} />
                  <SendVerifyEmailDialog />
                  <UpdatePasswordDialog />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 border rounded-md">
            <div
              className={
                'flex w-full items-center justify-between bg-muted-foreground/5 px-6 py-6'
              }
            >
              <span className="font-semibold text-md">
                {t('profile.profile')}
              </span>
              <div className="flex gap-2">

              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
              {Object.keys(formFields).map((key) => (
                <div key={key}>
                  {formFields[key as keyof typeof formFields]}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
