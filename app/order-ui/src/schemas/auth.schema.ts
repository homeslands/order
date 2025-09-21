import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import {
  AuthRules,
  NAME_REGEX,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
} from '@/constants'

export const loginSchema = z.object({
  phonenumber: z.string(),
  password: z.string(),
})

export function useRegisterSchema() {
  const { t } = useTranslation('auth')
  return z
    .object({
      email: z.string().email(),
      firstName: z
        .string()
        .min(1, t('register.firstNameRequired'))
        .max(100, t('register.firstNameTooLong'))
        .regex(NAME_REGEX, t('register.firstNameInvalid')),
      lastName: z
        .string()
        .min(1, t('register.lastNameRequired'))
        .max(100, t('register.lastNameTooLong'))
        .regex(NAME_REGEX, t('register.lastNameInvalid')),
      phonenumber: z
        .string()
        .min(10, t('register.phoneNumberRequired'))
        .max(10, t('register.phoneNumberMaxLength'))
        .regex(PHONE_NUMBER_REGEX, t('register.phoneNumberInvalid')),
      password: z
        .string()
        .min(AuthRules.MIN_LENGTH, {
          message: t('register.minLength', { count: AuthRules.MIN_LENGTH }),
        })
        .max(AuthRules.MAX_LENGTH, {
          message: t('register.maxLength', { count: AuthRules.MAX_LENGTH }),
        })
        .regex(PASSWORD_REGEX, t('register.passwordInvalid')),
      confirmPassword: z.string().min(1, t('register.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.passwordNotMatch'),
      path: ['confirmPassword'],
    })
}

export function useForgotPasswordSchema() {
  return z.object({
    email: z.string().email(),
  })
}

export function useResetPasswordSchema() {
  const { t } = useTranslation('auth')
  return z
    .object({
      newPassword: z
        .string()
        .min(AuthRules.MIN_LENGTH, {
          message: t('forgotPassword.passwordMin', {
            length: AuthRules.MIN_LENGTH,
          }),
        })
        .max(AuthRules.MAX_LENGTH, {
          message: t('forgotPassword.passwordMax', {
            length: AuthRules.MAX_LENGTH,
          }),
        })
        .regex(PASSWORD_REGEX, t('forgotPassword.passwordInvalid')),
      confirmPassword: z
        .string()
        .min(AuthRules.MIN_LENGTH, {
          message: t('forgotPassword.passwordMin', {
            length: AuthRules.MIN_LENGTH,
          }),
        })
        .max(AuthRules.MAX_LENGTH, {
          message: t('forgotPassword.passwordMax', {
            length: AuthRules.MAX_LENGTH,
          }),
        }),
      token: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('forgotPassword.passwordNotMatch'),
    })
}

export const verifyEmailSchema = z.object({
  accessToken: z.string(),
  email: z.string().email(),
})

export type TRegisterSchema = z.infer<ReturnType<typeof useRegisterSchema>>
export type TLoginSchema = z.infer<typeof loginSchema>
export type TResetPasswordSchema = z.infer<
  ReturnType<typeof useResetPasswordSchema>
>

export type TForgotPasswordSchema = z.infer<
  ReturnType<typeof useForgotPasswordSchema>
>
export type TVerifyEmailSchema = z.infer<typeof verifyEmailSchema>
