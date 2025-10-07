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
import { useUserBySlug } from '@/hooks'
import { showToast } from '@/utils'
import {
  ResetPasswordDialog,
  UpdateCustomerDialog,
} from '../dialog'
import { useParams } from 'react-router-dom'

export function SystemCustomerInfoTabsContent() {
  const { t } = useTranslation(['customer', 'toast'])
  const { slug } = useParams()
  const { data } = useUserBySlug(slug || '')

  const userProfile = data?.result

  const handleCopyEmail = () => {
    if (userProfile?.email) {
      navigator.clipboard.writeText(userProfile.email)
      showToast(t('toast.copyEmailSuccess'))
    }
  }

  const formFields = {
    firstName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('customer.firstName')}</span>
        <Input
          value={userProfile?.firstName}
          readOnly
          disabled
          placeholder={`${t('customer.firstName')}`}
        />
      </div>
    ),
    lastName: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('customer.lastName')}</span>
        <Input
          value={userProfile?.lastName}
          readOnly
          disabled
          placeholder={`${t('customer.lastName')}`}
        />
      </div>
    ),
    email: (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">{t('customer.email')}</span>
          {userProfile?.isVerifiedEmail ? (
            <div className="flex items-center text-green-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs">{t('customer.verified')}</span>
            </div>
          ) : (
            <div className="flex items-center text-destructive">
              <span className="text-xs">{t('customer.notVerified')}</span>
            </div>
          )}
        </div>
        <div className="flex relative gap-2">
          <Input
            value={userProfile?.email}
            readOnly
            disabled
            placeholder={t('customer.email')}
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
                  {t('customer.copyEmail')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    ),
    phonenumber: (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">{t('customer.phoneNumber')}</span>
          {userProfile?.isVerifiedPhonenumber ? (
            <div className="flex items-center text-green-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs">{t('customer.verified')}</span>
            </div>
          ) : (
            <div className="flex items-center text-destructive">
              <span className="text-xs">{t('customer.notVerified')}</span>
            </div>
          )}
        </div>
        <div className="flex relative gap-2">
          <Input
            value={userProfile?.phonenumber}
            readOnly
            disabled
            placeholder={t('customer.phoneNumber')}
            className={`border ${userProfile?.isVerifiedPhonenumber ? 'border-green-500 text-green-600 bg-green-50' : 'border-destructive text-destructive bg-destructive/10'} cursor-not-allowed dark:bg-gray-800 dark:text-gray-300`}
          />
        </div>
      </div>
    ),
    dob: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('customer.dob')}</span>
        <Input
          value={userProfile?.dob ? userProfile.dob : ''}
          readOnly
          disabled
          placeholder={`${t('customer.dob')}`}
        />
      </div>
    ),
    address: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-normal">{t('customer.address')}</span>
        <Textarea
          value={userProfile?.address}
          readOnly
          disabled
          placeholder={`${t('customer.address')}`}
        />
      </div>
    ),
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 justify-center md:justify-end">
        <UpdateCustomerDialog customer={userProfile} />
        <ResetPasswordDialog user={userProfile} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {Object.keys(formFields).map((key) => (
          <div key={key}>{formFields[key as keyof typeof formFields]}</div>
        ))}
      </div>
    </div>
  )
}
