import { useTranslation } from 'react-i18next'

import { Input, Card, CardContent } from '@/components/ui'
import { ProfilePicture } from '@/components/app/avatar'
import { useProfile, useUploadProfilePicture } from '@/hooks'
import { publicFileURL } from '@/constants'
import {
  UpdatePasswordDialog,
  UpdateProfileDialog,
} from '@/components/app/dialog'
import { showToast } from '@/utils'
import { useUserStore } from '@/stores'

export default function UserProfileCard() {
  const { t } = useTranslation(['profile', 'toast'])
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
        <span className="text-normal text-sm">{t('profile.firstName')}</span>
        <Input className="" value={userProfile?.firstName} readOnly />
      </div>
    ),
    lastName: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.lastName')}</span>
        <Input className="" value={userProfile?.lastName} readOnly />
      </div>
    ),
    email: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.email')}</span>
        <Input className="" value={userProfile?.email} readOnly />
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.phoneNumber')}</span>
        <Input className="" value={userProfile?.phonenumber} readOnly />
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.dob')}</span>
        <Input className="" value={userProfile?.dob} readOnly />
      </div>
    ),
    address: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.address')}</span>
        <Input className="" value={userProfile?.address} readOnly />
      </div>
    ),
    branch: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.branch')}</span>
        <Input className="" value={userProfile?.branch?.name} readOnly />
      </div>
    ),
  }
  return (
    <div>
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="flex flex-col gap-6 p-0">
          <div className="flex flex-row p-2">
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
            <div className="ml-4 flex flex-col justify-center">
              <span className="text-md font-bold">
                {userProfile?.lastName} {userProfile?.firstName}
              </span>
              <div className="text-description flex items-center"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-md border">
            <div
              className={
                'flex w-full items-center justify-between bg-muted-foreground/5 px-6 py-6'
              }
            >
              <span className="text-md font-semibold">
                {t('profile.profile')}
              </span>
              <div className="flex gap-2">
                <UpdateProfileDialog userProfile={userProfile} />
                <UpdatePasswordDialog />
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
