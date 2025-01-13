import { z } from 'zod'
import { useNavigate, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import { registerSchema } from '@/schemas'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { RegisterForm } from '@/components/app/form'
import { ROUTE } from '@/constants'
import { showToast } from '@/utils'
import { cn } from '@/lib/utils'
import { useRegister } from '@/hooks'

export default function Register() {
  const { t } = useTranslation(['auth'])

  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()

  const handleSubmit = async (data: z.infer<typeof registerSchema>) => {
    register(data, {
      onSuccess: () => {
        navigate(ROUTE.LOGIN, { replace: true })
        showToast(t('toast.registerSuccess'))
      },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <img
        src={LoginBackground}
        className="absolute left-0 top-0 h-full w-full sm:object-fill"
      />
      <div className="flex h-full w-full items-center justify-center py-10">
        <Card className="mx-auto w-96 border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className={cn('text-center text-2xl text-white')}>
              {t('register.welcome')}{' '}
            </CardTitle>
            <CardDescription className="text-center text-white">
              {t('register.description')}{' '}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm onSubmit={handleSubmit} isLoading={isPending} />
          </CardContent>
          <CardFooter className="flex gap-1 text-white">
            <span>{t('register.haveAccount')}</span>
            <NavLink
              to={ROUTE.LOGIN}
              className="text-center text-sm text-primary"
            >
              {t('register.login')}
            </NavLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
