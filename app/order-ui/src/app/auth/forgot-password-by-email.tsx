import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, OTPInput } from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { cn } from '@/lib/utils'
import { useForgotPasswordStore } from '@/stores'
import { ForgotPasswordByEmailForm, ResetPasswordForm } from '@/components/app/form'
import { TForgotPasswordByEmailSchema, TResetPasswordSchema } from '@/schemas'
import { useConfirmForgotPassword, useInitiateForgotPassword, useVerifyOTPForgotPassword, useResendOTPForgotPassword } from '@/hooks'
import { showToast, showErrorToastMessage } from '@/utils'
import { ROUTE, VerificationMethod } from '@/constants'

export default function ForgotPasswordByEmail() {
    const { t } = useTranslation(['auth'])
    const { t: tToast } = useTranslation(['toast'])
    const navigate = useNavigate()
    const { setEmail, setStep, step, email, clearForgotPassword, setToken, token, setExpireTime, expireTime, setTokenExpireTime, tokenExpireTime } = useForgotPasswordStore()
    const [otpValue, setOtpValue] = useState('')
    const [countdown, setCountdown] = useState(0)
    const [tokenCountdown, setTokenCountdown] = useState(0)
    const { mutate: initiateForgotPassword } = useInitiateForgotPassword()
    const { mutate: verifyOTPForgotPassword } = useVerifyOTPForgotPassword()
    const { mutate: confirmForgotPassword } = useConfirmForgotPassword()
    const { mutate: resendOTPForgotPassword } = useResendOTPForgotPassword()

    useEffect(() => {
        if (!expireTime || step !== 2) {
            setCountdown(0)
            return
        }

        const calculateTimeLeft = () => {
            const expireDate = new Date(expireTime).getTime()
            const now = new Date().getTime()
            const timeLeft = Math.floor((expireDate - now) / 1000)
            return Math.max(0, timeLeft)
        }

        setCountdown(calculateTimeLeft())

        const timer = setInterval(() => {
            const timeLeft = calculateTimeLeft()
            setCountdown(timeLeft)

            if (timeLeft <= 0) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [expireTime, step])

    useEffect(() => {
        if (!tokenExpireTime || step !== 3) {
            setTokenCountdown(0)
            return
        }

        const calculateTimeLeft = () => {
            const expireDate = new Date(tokenExpireTime).getTime()
            const now = new Date().getTime()
            const timeLeft = Math.floor((expireDate - now) / 1000)
            return Math.max(0, timeLeft)
        }

        setTokenCountdown(calculateTimeLeft())

        const timer = setInterval(() => {
            const timeLeft = calculateTimeLeft()
            setTokenCountdown(timeLeft)

            if (timeLeft <= 0) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [tokenExpireTime, step])

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const handleSubmit = (value: TForgotPasswordByEmailSchema) => {
        setEmail(value.email)

        // Kiểm tra nếu OTP vẫn còn hiệu lực và cùng email
        if (expireTime && email === value.email) {
            const expireDate = new Date(expireTime).getTime()
            const now = new Date().getTime()
            const timeLeft = Math.floor((expireDate - now) / 1000)

            if (timeLeft > 0) {
                // OTP vẫn còn hiệu lực, chuyển thẳng sang step 2
                showToast(tToast('toast.otpStillValid'))
                setStep(2)
                return
            }
        }

        initiateForgotPassword({ email: value.email, verificationMethod: VerificationMethod.EMAIL }, {
            onSuccess: (response) => {
                showToast(tToast('toast.sendVerifyEmailSuccess'))
                setExpireTime(response?.result?.expiresAt || '')
                setStep(2)
            },
            onError: () => {
                // Nếu có lỗi nhưng có expireTime, vẫn chuyển sang step 2
                if (expireTime) {
                    setStep(2)
                }
            }
        })
    }

    const handleVerifyOTP = () => {
        verifyOTPForgotPassword({ code: otpValue }, {
            onSuccess: (response) => {
                showToast(tToast('toast.verifyOTPSuccess'))
                setToken(response?.result?.token || '')

                // FE tự tính thời gian hết hạn: hiện tại + 5 phút
                const now = new Date()
                const expiresAt = new Date(now.getTime() + 5 * 60 * 1000) // 5 phút = 300,000 ms
                setTokenExpireTime(expiresAt.toISOString())

                // Clear OTP input sau khi verify thành công
                setOtpValue('')

                // Đợi một chút để đảm bảo store đã update
                setTimeout(() => {
                    setStep(3)
                }, 0)
            }
        })
    }

    const handleConfirmForgotPassword = (data: TResetPasswordSchema) => {
        if (tokenCountdown === 0) {
            showErrorToastMessage(tToast('toast.forgotPasswordTokenNotExists'))
            return
        }

        confirmForgotPassword({ newPassword: data.newPassword, token: data.token }, {
            onSuccess: () => {
                showToast(tToast('toast.confirmForgotPasswordSuccess'))
                clearForgotPassword()
                navigate(ROUTE.LOGIN)
            }
        })
    }

    const handleResendOTP = () => {
        resendOTPForgotPassword({ email: email, verificationMethod: VerificationMethod.EMAIL }, {
            onSuccess: (response) => {
                showToast(tToast('toast.sendVerifyEmailSuccess'))
                setExpireTime(response?.result?.expiresAt || '')
                setOtpValue('')
            }
        })
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
            // Clear OTP input khi quay lại step 1
            setOtpValue('')
        } else if (step === 3) {
            setStep(2)
            // Clear OTP input để user nhập lại
            setOtpValue('')
        }
    }

    return (
        <div className="flex relative justify-center items-center min-h-screen">
            <img src={LoginBackground} className="absolute top-0 left-0 w-full h-full sm:object-fill" />
            <div className="flex relative z-10 justify-center items-center w-full h-full">
                <Card className="sm:min-w-[24rem] bg-white border border-muted-foreground bg-opacity-10 mx-auto shadow-xl backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className={cn('text-2xl text-center text-white')}>
                            {t('forgotPassword.title')}
                        </CardTitle>
                        <CardDescription className="text-center text-white">
                            {t('forgotPassword.useEmailDescription')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <ForgotPasswordByEmailForm onSubmit={handleSubmit} />
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <OTPInput
                                    value={otpValue}
                                    onChange={setOtpValue}
                                    length={6}
                                    className="justify-center"
                                    allowText={true}
                                />
                                {countdown > 0 && (
                                    <div className="text-center text-white text-sm">
                                        {t('forgotPassword.otpExpiresIn')}: {formatTime(countdown)}
                                    </div>
                                )}
                                {countdown === 0 && expireTime && (
                                    <div className="text-center text-red-400 text-sm">
                                        {t('forgotPassword.otpExpired')}
                                    </div>
                                )}
                                <Button disabled={countdown === 0} onClick={handleVerifyOTP} className="w-full">
                                    {t('forgotPassword.verify')}
                                </Button>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        disabled={countdown === 0}
                                        variant="outline"
                                        onClick={handleResendOTP}
                                        className="w-full border-white hover:bg-white hover:text-black"
                                    >
                                        {t('forgotPassword.resendOTP', { time: countdown })}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleBack}
                                        className="w-full text-white hover:bg-white/10 hover:text-white"
                                    >
                                        {t('forgotPassword.backButton')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                {/* Hiển thị thời gian ngay đầu */}
                                {tokenCountdown > 0 && (
                                    <div className="text-center text-primary text-sm">
                                        {t('forgotPassword.tokenExpiresIn')}: {formatTime(tokenCountdown)}
                                    </div>
                                )}
                                {tokenCountdown === 0 && tokenExpireTime && (
                                    <div className="text-center text-red-400 text-sm">
                                        {t('forgotPassword.tokenExpired')}
                                    </div>
                                )}

                                <ResetPasswordForm
                                    token={token}
                                    onSubmit={handleConfirmForgotPassword}
                                    isLoading={tokenCountdown === 0}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

