import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, OTPInput } from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { cn } from '@/lib/utils'
import { useForgotPasswordStore } from '@/stores'
import { ForgotPasswordByEmailForm } from '@/components/app/form'
import { TForgotPasswordByEmailSchema } from '@/schemas'
import { useConfirmForgotPassword, useInitiateForgotPassword, useVerifyOTPForgotPassword, useResendOTPForgotPassword } from '@/hooks'
import { showToast, showErrorToastMessage } from '@/utils'
import { ROUTE, VerificationMethod } from '@/constants'
import { ForgotPasswordInput } from '@/components/app/input'

export default function ForgotPasswordByEmail() {
    const { t } = useTranslation(['auth'])
    const { t: tToast } = useTranslation(['toast'])
    const navigate = useNavigate()
    const { setEmail, setStep, step, email, clearForgotPassword, setToken, token } = useForgotPasswordStore()
    const [otpValue, setOtpValue] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { mutate: initiateForgotPassword } = useInitiateForgotPassword()
    const { mutate: verifyOTPForgotPassword } = useVerifyOTPForgotPassword()
    const { mutate: confirmForgotPassword } = useConfirmForgotPassword()
    const { mutate: resendOTPForgotPassword } = useResendOTPForgotPassword()

    const handleSubmit = (value: TForgotPasswordByEmailSchema) => {
        setEmail(value.email)
        initiateForgotPassword({ email: value.email, verificationMethod: VerificationMethod.EMAIL }, {
            onSuccess: () => {
                showToast(tToast('toast.sendVerifyEmailSuccess'))
                setStep(2)
            }
        })
    }

    const handleVerifyOTP = () => {
        verifyOTPForgotPassword({ code: otpValue }, {
            onSuccess: (response) => {
                showToast(tToast('toast.verifyOTPSuccess'))
                setToken(response?.result?.token || '')
                setStep(3)
            }
        })
    }

    const handleConfirmForgotPassword = () => {
        if (newPassword !== confirmPassword) {
            showErrorToastMessage(tToast('toast.passwordNotMatch'))
            return
        }

        confirmForgotPassword({ newPassword: newPassword, token: token }, {
            onSuccess: () => {
                showToast(tToast('toast.confirmForgotPasswordSuccess'))
                clearForgotPassword()
                navigate(ROUTE.LOGIN)
            }
        })
    }

    const handleResendOTP = () => {
        resendOTPForgotPassword({ email: email, verificationMethod: VerificationMethod.EMAIL }, {
            onSuccess: () => {
                showToast(tToast('toast.sendVerifyEmailSuccess'))
            }
        })
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        } else if (step === 3) {
            setStep(2)
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
                                <Button onClick={handleVerifyOTP} className="w-full">
                                    {t('forgotPassword.verify')}
                                </Button>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleResendOTP}
                                        className="w-full border-white hover:bg-white hover:text-black"
                                    >
                                        {t('forgotPassword.resendOTP')}
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
                                <ForgotPasswordInput
                                    newPassword={newPassword}
                                    confirmPassword={confirmPassword}
                                    onChangeNewPassword={setNewPassword}
                                    onChangeConfirmPassword={setConfirmPassword}
                                />
                                <Button onClick={handleConfirmForgotPassword} className="w-full">
                                    {t('forgotPassword.reset')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    className="w-full text-white hover:bg-white/10 hover:text-white"
                                >
                                    {t('forgotPassword.backButton')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

