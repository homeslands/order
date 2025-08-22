import { Copy, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
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
import { useEffect, useState } from 'react'

export default function UserProfileCard() {
  const { t } = useTranslation(['profile', 'toast'])
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const { data, refetch } = useProfile()
  const { userInfo, setUserInfo, emailVerificationStatus } = useUserStore()
  const { mutate: uploadProfilePicture } = useUploadProfilePicture()

  useEffect(() => {
    if (emailVerificationStatus?.expiresAt) {
      setIsVerifyingEmail(true)
    }
  }, [emailVerificationStatus?.expiresAt])

  const handleUploadProfilePicture = (file: File) => {
    uploadProfilePicture(file, {
      onSuccess: (data) => {
        showToast(t('toast.uploadProfilePictureSuccess'))
        setUserInfo(data.result)
      },
    })
  }

  const handleCopyEmail = () => {
    if (userProfile?.email) {
      navigator.clipboard.writeText(userProfile.email)
      showToast(t('toast.copyEmailSuccess'))
    }
  }

  const handleVerifyEmailSuccess = () => {
    setIsVerifyingEmail(false)
    refetch()
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
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">{t('profile.email')}</span>
          {userProfile?.isVerifiedEmail ? (
            <div className="flex items-center text-green-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs">{t('profile.verified')}</span>
            </div>
          ) : (
            <div className="flex items-center text-destructive">
              <span className="text-xs">{isVerifyingEmail ? t('profile.verifyingEmail') : t('profile.notVerified')}</span>
            </div>
          )}
        </div>
        <div className="flex relative gap-2">
          <Input
            value={userProfile?.email}
            readOnly
            disabled
            placeholder={t('profile.email')}
            className={`border ${userProfile?.isVerifiedEmail ? 'border-green-500 text-green-600 bg-green-50' : 'border-destructive text-destructive bg-destructive/5'} cursor-not-allowed dark:bg-gray-800 dark:text-gray-300`}
          />
          {userProfile?.email && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopyEmail}
                    className="absolute right-3 top-1/2 text-gray-500 transform -translate-y-1/2 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t('profile.copyEmail')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
        <Textarea
          value={userProfile?.address}
          readOnly
          disabled
          placeholder={`${t('profile.address')}`}
        />
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
          <div className="flex flex-row justify-between p-4  rounded-md border">
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
                  {userProfile?.lastName} {userProfile?.firstName} aaaaaa
                </span>
                <div className="flex items-center text-description"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-md border">
            <div
              className={
                'flex flex-col justify-start items-start px-6 py-6 w-full lg:flex-row lg:justify-between lg:items-center bg-muted-foreground/5'
              }
            >
              <span className="font-semibold text-md">
                {t('profile.profile')}
              </span>
              <div className="flex gap-2">
                <UpdateProfileDialog userProfile={userProfile} />
                {!userProfile?.isVerifiedEmail && (
                  <SendVerifyEmailDialog onSuccess={handleVerifyEmailSuccess} />
                )}
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
