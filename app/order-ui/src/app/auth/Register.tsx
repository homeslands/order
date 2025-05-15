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
import { LoginBackground, } from '@/assets/images'
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
    <div className="flex relative justify-center items-center min-h-screen">
      <img
        src={LoginBackground}
        className="object-cover absolute top-0 left-0 w-full h-full sm:object-fill"
      />

      <div className="flex justify-center items-center w-full h-full">
        <Card className="mx-auto sm:w-[36rem] h-[32rem] sm:h-fit overflow-y-auto w-[calc(100vw-1rem)] border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-0">
            <CardTitle className={cn('text-xl text-center text-white sm:text-2xl')}>
              {/* {t('register.welcome')}{' '} */}
              {t('register.description')}{' '}
            </CardTitle>
            <CardDescription className="text-center text-white">

            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm onSubmit={handleSubmit} isLoading={isPending} />
          </CardContent>
          <CardFooter className="flex gap-1 text-white">
            <span>{t('register.haveAccount')}</span>
            <NavLink
              to={ROUTE.LOGIN}
              className="text-sm text-center text-primary"
            >
              {t('register.login')}
            </NavLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
