import { useTranslation } from 'react-i18next'

import { Input, Textarea } from '@/components/ui'
import { useProfile } from '@/hooks'
import { SendVerifyEmailDialog, UpdatePasswordDialog } from '@/components/app/dialog'
import UpdateCustomerProfileDialog from '../dialog/update-customer-profile-dialog'

export function CustomerInfoTabsContent() {
  const { t } = useTranslation(['profile', 'toast'])
  const { data } = useProfile()

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
        <span className="text-sm text-normal">{t('profile.email')}</span>
        <Input
          value={userProfile?.email}
          readOnly
          disabled
          placeholder={`${t('profile.email')}`}
        />
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.phoneNumber')}</span>
        <Input
          value={userProfile?.phonenumber}
          readOnly
          disabled
          placeholder={`${t('profile.phoneNumber')}`}
        />
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('profile.dob')}</span>
        <Input
          value={userProfile?.dob}
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
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {Object.keys(formFields).map((key) => (
          <div key={key}>{formFields[key as keyof typeof formFields]}</div>
        ))}
      </div>
      <div className="grid grid-cols-2 mt-4 sm:flex sm:justify-end sm:gap-2">
        <UpdateCustomerProfileDialog userProfile={userProfile} />
        <SendVerifyEmailDialog />
        <UpdatePasswordDialog />
      </div>
    </div>
  )
}
