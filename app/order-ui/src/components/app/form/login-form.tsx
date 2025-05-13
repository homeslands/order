import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button,
  PasswordInput,
} from '@/components/ui'
import { loginSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'
import { useLogin, useProfile } from '@/hooks'
import { useAuthStore, useCartItemStore, useUserStore } from '@/stores'
import { showToast } from '@/utils'

export const LoginForm: React.FC = () => {
  const { t } = useTranslation(['auth'])
  const {
    setToken,
    setRefreshToken,
    setExpireTime,
    setExpireTimeRefreshToken,
  } = useAuthStore()
  const { clearCart } = useCartItemStore()
  const { setUserInfo } = useUserStore()
  const { mutate: login, isPending } = useLogin()
  const { refetch: refetchProfile } = useProfile()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phonenumber: '',
      password: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    login(data, {
      onSuccess: async (response) => {
        clearCart()
        setToken(response.result.accessToken)
        setRefreshToken(response.result.refreshToken)
        setExpireTime(response.result.expireTime)
        setExpireTimeRefreshToken(response.result.expireTimeRefreshToken)

        const profile = await refetchProfile()
        if (profile.data) {
          setUserInfo(profile.data.result)
        }
        showToast(t('toast.loginSuccess'))
      },
    })
  }

  const formFields = {
    phonenumber: (
      <FormField
        control={form.control}
        name="phonenumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.phoneNumber')}</FormLabel>
            <FormControl>
              <Input placeholder={t('login.enterPhoneNumber')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    password: (
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.password')}</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={t('login.enterPassword')}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  return (
    <div className="mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-2 text-white md:w-[24rem]">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between items-center w-full">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <ButtonLoading /> : t('login.title')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
