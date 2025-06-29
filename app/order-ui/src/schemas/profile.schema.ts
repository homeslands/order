import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { AuthRules, EMOJI_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@/constants'

export function useUpdateProfileSchema() {
  const { t } = useTranslation('profile')

  return z.object({
    firstName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, t('profile.firstNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, t('profile.firstNameTooLong'))
      .regex(NAME_REGEX, t('profile.firstNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: t('profile.firstNameEmojiInvalid'),
      }),

    lastName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, t('profile.lastNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, t('profile.lastNameTooLong'))
      .regex(NAME_REGEX, t('profile.lastNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: t('profile.lastNameEmojiInvalid'),
      }),

    dob: z
      .string()
      .min(1, t('profile.dobRequired'))
      .refine(
        (val) => {
          const date = new Date(val)
          return !isNaN(date.getTime())
        },
        {
          message: t('profile.dobInvalid'),
        },
      ),

    address: z
      .string()
      .min(1, t('profile.addressRequired'))
      .max(AuthRules.MAX_ADDRESS_LENGTH, t('profile.addressTooLong'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: t('profile.addressEmojiInvalid'),
      }),

    branch: z.string().optional(),
  })
}

export function useUpdatePasswordSchema() {
  const { t } = useTranslation('auth')

  return z
    .object({
      oldPassword: z.string().min(1, t('login.oldPasswordRequired')),
      newPassword: z
        .string()
        .min(AuthRules.MIN_LENGTH, {
          message: t('login.minLength', { length: AuthRules.MIN_LENGTH }),
        })
        .max(AuthRules.MAX_LENGTH, {
          message: t('login.maxLength', { length: AuthRules.MAX_LENGTH }),
        })
        .regex(PASSWORD_REGEX, t('login.passwordInvalid')),
      confirmPassword: z.string().min(1, t('login.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      message: t('login.passwordSameAsOld'),
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('login.passwordNotMatch'),
      path: ['confirmPassword'],
    })
}

export type TUpdateProfileSchema = z.infer<
  ReturnType<typeof useUpdateProfileSchema>
>
export type TUpdatePasswordSchema = z.infer<
  ReturnType<typeof useUpdatePasswordSchema>
>
