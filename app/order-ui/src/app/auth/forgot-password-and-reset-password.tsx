import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { ResetPasswordForForgotPasswordForm } from '@/components/app/form'
import { cn } from '@/lib/utils'

export default function ForgotPasswordAndResetPassword() {
  const { t } = useTranslation(['auth'])

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <img
        src={LoginBackground}
        className="absolute left-0 top-0 h-full w-full sm:object-fill"
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <Card className="mx-auto border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl sm:min-w-[24rem]">
          <CardHeader>
            <CardTitle className={cn('text-center text-2xl text-white')}>
              {t('forgotPassword.resetPassword')}{' '}
            </CardTitle>
            {/* <CardTitle className={cn('text-2xl text-white')}>{t('login.title')} </CardTitle> */}
            <CardDescription className="text-center text-white">
              {' '}
              {t('forgotPassword.description')}{' '}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
