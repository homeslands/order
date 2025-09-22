import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
  Checkbox,
  Label,
} from '@/components/ui'
import { useRegisterSchema, TRegisterSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'

import { ROUTE } from '@/constants'
import { IRegisterSchema } from '@/types'
import { PasswordWithRulesInput } from '../input'

interface IFormRegisterProps {
  onSubmit: (data: IRegisterSchema) => void
  isLoading: boolean
}

export const RegisterForm: React.FC<IFormRegisterProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation(['auth'])
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)
  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(useRegisterSchema()),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phonenumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = (values: IRegisterSchema) => {
    onSubmit(values)
  }

  const formFields = {
    firstName: (
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('register.firstName')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('register.enterFirstName')}
                {...field}
                onKeyDown={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault(); // chặn không cho nhập số
                  }
                }}
              />
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
            <FormLabel>{t('register.lastName')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('register.enterLastName')}
                {...field}
                onKeyDown={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault(); // chặn không cho nhập số
                  }
                }}
              />
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
            <FormLabel>{t('register.phoneNumber')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('register.enterPhoneNumber')}
                {...field}
                onChange={(e) => {
                  // Chỉ giữ lại các ký tự là số
                  const onlyNumbers = e.target.value.replace(/\D/g, '')
                  field.onChange(onlyNumbers) // Gán lại cho field dạng string
                }}
                inputMode="numeric" // Gợi ý bàn phím số trên mobile
                pattern="[0-9]*"     // Gợi ý trình duyệt chỉ cho nhập số
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    email: (
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('register.email')}</FormLabel>
            <FormControl>
              <Input placeholder={t('register.enterEmail')} {...field} />
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
            <FormLabel>{t('register.password')}</FormLabel>
            <FormControl>
              {/* <PasswordInput
                placeholder={t('register.enterPassword')}
                {...field}
              /> */}
              <PasswordWithRulesInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('register.enterPassword')}
                disabled={field.disabled}
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
            <FormLabel>{t('register.confirmPassword')}</FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={t('register.enterPassword')}
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
