import { ChevronRight, Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { cn } from '@/lib/utils'
import { ROUTE, VerificationMethod } from '@/constants'
import { StepProgressBar } from './components'
import { useForgotPasswordStore } from '@/stores'

export default function ForgotPassword() {
    const { t } = useTranslation(['auth'])
    const { setVerificationMethod, setStep } = useForgotPasswordStore()

    const steps = [
        t('forgotPassword.step.chooseMethod'), // "Chọn phương thức"
        t('forgotPassword.step.verify'),       // "Xác thực OTP"
        t('forgotPassword.step.resetPassword') // "Đặt lại mật khẩu"
    ]

    const handleMethodSelect = (method: VerificationMethod) => {
        setVerificationMethod(method)
        setStep(1) // Reset về step 1 khi chọn method mới
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen">
            <img src={LoginBackground} className="absolute top-0 left-0 w-full h-full sm:object-fill" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
                <Card className="sm:min-w-[36rem] bg-white border border-muted-foreground bg-opacity-10 shadow-xl backdrop-blur-xl">
                    <CardHeader>
                        <StepProgressBar currentStep={1} steps={steps} />

                        <CardTitle className={cn('text-2xl text-center text-white')}>
                            {t('forgotPassword.title')}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-4 items-start justify-start text-white">
                            <NavLink
                                to={ROUTE.FORGOT_PASSWORD_BY_EMAIL}
                                onClick={() => handleMethodSelect(VerificationMethod.EMAIL)}
                                className="flex flex-row gap-2 items-center justify-start text-primary hover:underline"
                            >
                                <Mail size={20} />
                                {t('forgotPassword.emailMethod')} <ChevronRight size={16} />
                            </NavLink>
                            <NavLink
                                to={ROUTE.FORGOT_PASSWORD_BY_PHONE}
                                onClick={() => handleMethodSelect(VerificationMethod.PHONE_NUMBER)}
                                className="flex flex-row gap-2 items-center justify-start text-primary hover:underline"
                            >
                                <Phone size={20} />
                                {t('forgotPassword.phoneMethod')} <ChevronRight size={16} />
                            </NavLink>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <NavLink to={ROUTE.LOGIN} className="text-sm text-center text-white hover:underline">
                            {t('forgotPassword.backToLogin')}
                        </NavLink>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
