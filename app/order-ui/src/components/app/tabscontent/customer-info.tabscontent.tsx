import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, ShieldCheck } from 'lucide-react'

import {
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { useProfile } from '@/hooks'
import { showToast } from '@/utils'
import {
  SendVerifyEmailDialog,
  SendVerifyPhoneNumberDialog,
  UpdateCustomerProfileDialog,
  UpdatePasswordDialog,
} from '../dialog'
import { useUserStore } from '@/stores'

export function CustomerInfoTabsContent() {
  const { t } = useTranslation(['profile', 'toast'])
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isVerifyingPhoneNumber, setIsVerifyingPhoneNumber] = useState(false)
  const { data, refetch } = useProfile()
  const { emailVerificationStatus, phoneNumberVerificationStatus } = useUserStore()

  // check if emailVerificationStatus is not null, then set isVerifyingEmail to true
  useEffect(() => {
    if (emailVerificationStatus?.expiresAt) {
      setIsVerifyingEmail(true)
    }
    if (phoneNumberVerificationStatus?.expiresAt) {
      setIsVerifyingPhoneNumber(true)
    }
  }, [emailVerificationStatus?.expiresAt, phoneNumberVerificationStatus?.expiresAt])

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

  const handleVerifyPhoneNumberSuccess = () => {
    setIsVerifyingPhoneNumber(false)
    refetch()
  }

  const userProfile = data?.result
  const formFields = {
    firstName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.firstName')}</span>
        <Input
          value={userProfile?.firstName}
          readOnly
          disabled
          placeholder={`${t('profile.firstName')}`}
        />
      </div>
    ),
    lastName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.lastName')}</span>
        <Input
          value={userProfile?.lastName}
          readOnly
          disabled
          placeholder={`${t('profile.lastName')}`}
        />
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
            className={`border ${userProfile?.isVerifiedEmail ? 'border-green-500 text-green-600 bg-green-50' : 'border-destructive text-destructive bg-destructive/10'} cursor-not-allowed dark:bg-gray-800 dark:text-gray-300`}
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
          {!userProfile?.isVerifiedEmail && (
            <SendVerifyEmailDialog onSuccess={handleVerifyEmailSuccess} />
          )}
        </div>
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">{t('profile.phoneNumber')}</span>
          {userProfile?.isVerifiedPhonenumber ? (
            <div className="flex items-center text-green-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs">{t('profile.verified')}</span>
            </div>
          ) : (
            <div className="flex items-center text-destructive">
              <span className="text-xs">{isVerifyingPhoneNumber ? t('profile.verifyingPhoneNumber') : t('profile.notVerified')}</span>
            </div>
          )}
        </div>
        <div className="flex relative gap-2">
          <Input
            value={userProfile?.phonenumber}
            readOnly
            disabled
            placeholder={t('profile.phoneNumber')}
            className={`border ${userProfile?.isVerifiedPhonenumber ? 'border-green-500 text-green-600 bg-green-50' : 'border-destructive text-destructive bg-destructive/10'} cursor-not-allowed dark:bg-gray-800 dark:text-gray-300`}
          />
          {!userProfile?.isVerifiedPhonenumber && (
            <SendVerifyPhoneNumberDialog onSuccess={handleVerifyPhoneNumberSuccess} />
          )}
        </div>
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.dob')}</span>
        <Input
          value={userProfile?.dob ? userProfile.dob : ''}
          readOnly
          disabled
          placeholder={`${t('profile.dob')}`}
        />
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
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 justify-center md:justify-end">
        <UpdateCustomerProfileDialog userProfile={userProfile} />
        <UpdatePasswordDialog />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {Object.keys(formFields).map((key) => (
          <div key={key}>{formFields[key as keyof typeof formFields]}</div>
        ))}
      </div>
    </div>
  )
}
