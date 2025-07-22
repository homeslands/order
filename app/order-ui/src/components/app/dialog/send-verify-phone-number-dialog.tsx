import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2, ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  OTPInput,
  CountdownTimer,
} from '@/components/ui'

import { useConfirmPhoneNumberVerification, useResendPhoneNumberVerification, useVerifyPhoneNumber } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useUserStore } from '@/stores'

export default function SendVerifyPhoneNumberDialog({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { userInfo, setPhoneNumberVerificationStatus, phoneNumberVerificationStatus } = useUserStore()
  const { t } = useTranslation(['profile', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const { mutate: verifyPhoneNumber } = useVerifyPhoneNumber()
  const { mutate: confirmPhoneNumberVerification, isPending: isConfirmingPhoneNumberVerification } = useConfirmPhoneNumberVerification()
  const { mutate: resendPhoneNumberVerification, isPending: isResendingPhoneNumberVerification } = useResendPhoneNumberVerification()

  // use useEffect to check if phoneNumberVerificationStatus is not null, then set isOpen to true
  useEffect(() => {
    if (phoneNumberVerificationStatus?.expiresAt) {
      setIsOpen(true)
    }
  }, [phoneNumberVerificationStatus?.expiresAt])

  const handleOpenDialog = () => {
    setIsOpen(true)
    // Don't reset store - let existing state determine which component to show
    // Only reset local OTP input value if no verification is in progress
    if (!phoneNumberVerificationStatus?.expiresAt) {
      setOtpValue('')
    }
  }

  const handleSubmit = () => {
    verifyPhoneNumber(undefined, {
      onSuccess: (response) => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.profile],
        })
        // Store the expiration time and slug from response
        setPhoneNumberVerificationStatus({
          expiresAt: response.result.expiresAt
        })
        showToast(t('toast.sendVerifyPhoneNumberSuccess'))
        // Don't close dialog, show OTP input instead
      },
    })
  }

  const handleVerifyOtp = async () => {

    if (otpValue.length !== 6) {
      showToast(t('toast.invalidOtp'))
      return
    }

    setIsVerifyingOtp(true)

    try {
      // Mock OTP verification - replace with real API call
      confirmPhoneNumberVerification(otpValue, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERYKEY.profile],
          })
          showToast(t('profile.verifyPhoneNumberSuccessfully'))
          setPhoneNumberVerificationStatus(null)
          setIsOpen(false)
          setOtpValue('')
          onSuccess()
        },
      })

    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResendOtp = () => {
    resendPhoneNumberVerification(undefined, {
      onSuccess: (response) => {
        setPhoneNumberVerificationStatus({
          expiresAt: response.result.expiresAt
        })
        showToast(t('toast.resendVerifyPhoneNumberSuccess'))
        setOtpValue('')
      },
    })
  }

  const handleCountdownExpired = () => {
    setPhoneNumberVerificationStatus(null)
    setOtpValue('')
  }

  // Show OTP input if verification has started
  const showOtpInput = phoneNumberVerificationStatus?.expiresAt

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-fit">
        <Button className="gap-1 px-2 text-sm" onClick={() => handleOpenDialog()}>
          <span className="text-xs sm:text-sm">{t('profile.verify')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('profile.verifyPhoneNumber')}
            </div>
          </DialogTitle>
        </DialogHeader>

        {showOtpInput ? (
          // OTP Input Section
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.otpCode')}
                </label>
              </div>

              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                length={6}
                className="justify-center"
                allowText={true}
              />

              {phoneNumberVerificationStatus?.expiresAt && (
                <CountdownTimer
                  expiresAt={phoneNumberVerificationStatus.expiresAt}
                  onExpired={handleCountdownExpired}
                  className="mt-2"
                />
              )}
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otpValue.length !== 6 || isConfirmingPhoneNumberVerification}
              className="w-full"
            >
              {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : isConfirmingPhoneNumberVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.verifyOtp')}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOtp}
              className="w-full"
              disabled={isResendingPhoneNumberVerification}
            >
              {isResendingPhoneNumberVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.resendOtp')}
            </Button>
          </div>
        ) : (
          // Description and Send Verification Button
          <div className="space-y-4">
            {userInfo?.phonenumber ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-white">
                  <span>
                    {t('profile.verifyPhoneNumberDescription')}
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {userInfo.phonenumber}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground dark:text-white">
                  {t('profile.verifyPhoneNumberDescription2')}
                </span>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isConfirmingPhoneNumberVerification || isResendingPhoneNumberVerification}
                >
                  {isConfirmingPhoneNumberVerification || isResendingPhoneNumberVerification ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('profile.sendVerifyPhoneNumber')
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-500 dark:text-red-400">
                  {t('profile.noPhoneNumber')}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
