import { useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

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
import { IRegisterSchema } from '@/types'
import { useTheme } from '@/components/app/theme-provider'

export default function Register() {
  const { t } = useTranslation(['auth'])
  const { theme, setTheme } = useTheme()

  // set theme as light mode by default
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light')
    }
  }, [theme, setTheme])

  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()

  const handleSubmit = async (data: IRegisterSchema) => {
    register(data, {
      onSuccess: () => {
        navigate(ROUTE.LOGIN, { replace: true })
        showToast(t('toast.registerSuccess'))
      },
    })
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <img
        src={LoginBackground}
        className="absolute top-0 left-0 object-cover w-full h-full sm:object-fill"
      />

      <div className="flex items-center justify-center w-full h-full">
        <Card className="mx-auto sm:w-[36rem] h-[40rem] sm:h-fit overflow-y-auto w-[calc(100vw-1rem)] border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl">
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
