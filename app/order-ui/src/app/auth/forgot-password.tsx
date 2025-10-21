import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { cn } from '@/lib/utils'
import { ROUTE, VerificationMethod } from '@/constants'
import { ArrowRightIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { useForgotPasswordStore } from '@/stores'

export default function ForgotPassword() {
    const { t } = useTranslation(['auth'])
    const { setVerificationMethod, setStep } = useForgotPasswordStore()

    const handleMethodSelect = (method: VerificationMethod) => {
        setVerificationMethod(method)
        setStep(1)
    }

    return (
        <div className="flex relative justify-center items-center min-h-screen">
            <img src={LoginBackground} className="absolute top-0 left-0 w-full h-full sm:object-fill" />
            <div className="flex relative z-10 justify-center items-center w-full h-full">
                <Card className="sm:min-w-[24rem] bg-white border border-muted-foreground bg-opacity-10 mx-auto shadow-xl backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className={cn('text-2xl text-center text-white')}>
                            {t('forgotPassword.title')}{' '}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <NavLink
                                to={ROUTE.FORGOT_PASSWORD_BY_EMAIL}
                                onClick={() => handleMethodSelect(VerificationMethod.EMAIL)}
                                className="flex gap-2 justify-start items-center text-primary hover:underline"
                            >
                                <MailIcon className="w-4 h-4" />{t('forgotPassword.useEmail')} <ArrowRightIcon className="w-4 h-4" />
                            </NavLink>
                            <NavLink
                                to={ROUTE.FORGOT_PASSWORD_BY_PHONE}
                                onClick={() => handleMethodSelect(VerificationMethod.PHONE_NUMBER)}
                                className="flex gap-2 justify-start items-center text-primary hover:underline"
                            >
                                <PhoneIcon className="w-4 h-4" />{t('forgotPassword.usePhoneNumber')} <ArrowRightIcon className="w-4 h-4" />
                            </NavLink>
                        </div>
                        <NavLink to={ROUTE.LOGIN} className="flex justify-start items-center mt-4 text-sm text-white hover:underline">
                            {t('forgotPassword.backButton')}
                        </NavLink>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
