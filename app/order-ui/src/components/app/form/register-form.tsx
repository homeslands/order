import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

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
  Checkbox,
  Label,
} from '@/components/ui'
import { registerSchema, TRegisterSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'
import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTE } from '@/constants'

interface IFormRegisterProps {
  onSubmit: (data: z.infer<typeof registerSchema>) => void
  isLoading: boolean
}

export const RegisterForm: React.FC<IFormRegisterProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation(['auth'])
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)
  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phonenumber: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  })

  const handleSubmit = (values: z.infer<typeof registerSchema>) => {
    onSubmit(values)
  }

  const formFields = {
    email: (
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.email')}</FormLabel>
            <FormControl>
              <Input placeholder={t('login.enterEmail')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
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
    confirmPassword: (
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.confirmPassword')}</FormLabel>
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
    firstName: (
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.firstName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('login.enterFirstName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    lastName: (
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('login.lastName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('login.enterLastName')} {...field} />
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
          <div className="grid grid-cols-1 gap-2 text-white sm:grid-cols-2">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
          {/* policy condition */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                className="mt-0.5"
                id="terms"
                checked={isTermsAccepted}
                onCheckedChange={(checked) => setIsTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-gray-300">
                {t('register.policyCondition')}
                <Link to={ROUTE.POLICY} className="text-primary hover:underline">
                  {t('register.policy')}
                </Link>
                <span className="text-gray-300">
                  {t('register.and')}
                </span>
                <Link to={ROUTE.SECURITY} className="text-primary hover:underline">
                  {t('register.securityTerm')}
                </Link>
                {t('register.ofTrendCoffee')}
              </Label>
            </div>
          </div>
          <Button
            type="submit"
            className="mt-5 w-full"
            disabled={isLoading || !isTermsAccepted}
          >
            {isLoading ? <ButtonLoading /> : t('register.title')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
