import { useTranslation } from 'react-i18next'

import { Input, Textarea } from '@/components/ui'
import { useProfile } from '@/hooks'
import {
  UpdatePasswordDialog,
  UpdateProfileDialog,
} from '@/components/app/dialog'

export function CustomerInfoTabsContent() {
  const { t } = useTranslation(['profile', 'toast'])
  const { data } = useProfile()

  const userProfile = data?.result
  const formFields = {
    firstName: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.firstName')}</span>
        <Input
          className=""
          value={userProfile?.firstName}
          readOnly
          disabled
          placeholder={`${t('profile.firstName')}`}
        />
      </div>
    ),
    lastName: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.lastName')}</span>
        <Input
          className=""
          value={userProfile?.lastName}
          readOnly
          disabled
          placeholder={`${t('profile.lastName')}`}
        />
      </div>
    ),
    email: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.email')}</span>
        <Input
          className=""
          value={userProfile?.email}
          readOnly
          disabled
          placeholder={`${t('profile.email')}`}
        />
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.phoneNumber')}</span>
        <Input
          className=""
          value={userProfile?.phonenumber}
          readOnly
          disabled
          placeholder={`${t('profile.phoneNumber')}`}
        />
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.dob')}</span>
        <Input
          className=""
          value={userProfile?.dob}
          readOnly
          disabled
          placeholder={`${t('profile.dob')}`}
        />
      </div>
    ),
    address: (
      <div className="flex flex-col gap-1">
        <span className="text-normal text-sm">{t('profile.address')}</span>
        <Textarea
          className=""
          value={userProfile?.address}
          readOnly
          disabled
          placeholder={`${t('profile.address')}`}
        />
      </div>
    ),
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        {Object.keys(formFields).map((key) => (
          <div key={key}>{formFields[key as keyof typeof formFields]}</div>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <UpdateProfileDialog userProfile={userProfile} />
        <UpdatePasswordDialog />
      </div>
    </div>
  )
}
