import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2, Mail, ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  Input,
  DialogDescription,
  OTPInput,
  CountdownTimer,
} from '@/components/ui'

import { IVerifyEmailRequest } from '@/types'
import { useConfirmEmailVerification, useResendEmailVerification, useVerifyEmail } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useAuthStore, useUserStore } from '@/stores'
import { TVerifyEmailSchema, verifyEmailSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SendVerifyEmailDialog({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const { userInfo, setEmailVerificationStatus, emailVerificationStatus } = useUserStore()
  const { t } = useTranslation(['profile', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const { mutate: verifyEmail } = useVerifyEmail()
  const { mutate: confirmEmailVerification, isPending: isConfirmingEmailVerification } = useConfirmEmailVerification()
  const { mutate: resendEmailVerification, isPending: isResendingEmailVerification } = useResendEmailVerification()

  const form = useForm<TVerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      accessToken: token,
      email: userInfo?.email || '',
    },
  })

  // use useEffect to check if emailVerificationStatus is not null, then set isOpen to true
  useEffect(() => {
    if (emailVerificationStatus?.startedAt) {
      setIsOpen(true)
    }
  }, [emailVerificationStatus?.startedAt])

  useEffect(() => {
    // Update form values when userInfo changes
    form.reset({
      accessToken: token,
      email: userInfo?.email || '',
    })
  }, [userInfo?.email, token, form])

  const handleOpenDialog = () => {
    setIsOpen(true)
    // Don't reset store - let existing state determine which component to show
    // Only reset local OTP input value if no verification is in progress
    if (!emailVerificationStatus?.startedAt) {
      setOtpValue('')
    }
  }

  const handleSubmit = (data: IVerifyEmailRequest) => {
    verifyEmail(data, {
      onSuccess: (response) => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.profile],
        })
        // get current url and set to store
        setEmailVerificationStatus({
          startedAt: response.timestamp,
        })
        showToast(t('toast.sendVerifyEmailSuccess'))
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
      confirmEmailVerification(otpValue, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERYKEY.profile],
          })
          showToast(t('profile.verifyEmailSuccessfully'))
          setEmailVerificationStatus(null)
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
    resendEmailVerification(undefined, {
      onSuccess: (response) => {
        setEmailVerificationStatus({
          startedAt: response.timestamp,
        })
        showToast(t('toast.resendVerifyEmailSuccess'))
        setOtpValue('')
      },
    })
  }

  const handleCountdownExpired = () => {
    setEmailVerificationStatus(null)
    setOtpValue('')
  }

  const formFields = {
    email: (
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.email')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterEmail')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  // Show OTP input if verification has started
  const showOtpInput = emailVerificationStatus?.startedAt

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-fit">
        <Button className="gap-1 px-2 text-sm" onClick={() => handleOpenDialog()}>
          <Mail className="hidden sm:block" />
          <span className="text-xs sm:text-sm">{t('profile.verifyEmail')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('profile.verifyEmail')}
            </div>
          </DialogTitle>
          <DialogDescription>
            {showOtpInput
              ? t('profile.otpDescription')
              : t('profile.verifyEmailDescription')
            }
          </DialogDescription>
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

              {emailVerificationStatus?.startedAt && (
                <CountdownTimer
                  startTime={emailVerificationStatus.startedAt}
                  duration={10} // 10 minutes
                  onExpired={handleCountdownExpired}
                  className="mt-2"
                />
              )}
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otpValue.length !== 6 || isConfirmingEmailVerification}
              className="w-full"
            >
              {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : isConfirmingEmailVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.verifyOtp')}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOtp}
              className="w-full"
              disabled={isResendingEmailVerification}
            >
              {isResendingEmailVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.resendOtp')}
            </Button>
          </div>
        ) : (
          // Email Input Section
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(formFields).map((key) => (
                  <React.Fragment key={key}>
                    {formFields[key as keyof typeof formFields]}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-end">
                <Button className="flex justify-end" type="submit">
                  {t('profile.sendVerifyEmail')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
