import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import {
  AuthRules,
  EMOJI_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
} from '@/constants'

export const userInfoSchema = z.object({
  slug: z.string(),
  image: z.string().optional(),
  phonenumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(),
  email: z.string(),
  address: z.string(),
  branch: z.string(),
})

export const userRoleSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
})

export function useCreateUserSchema() {
  const { t } = useTranslation(['auth'])
  const { t: tProfile } = useTranslation(['profile'])
  return z
    .object({
      phonenumber: z
        .string()
        .min(10, t('register.phoneNumberRequired'))
        .max(10, t('register.phoneNumberMaxLength'))
        .regex(PHONE_NUMBER_REGEX, t('register.phoneNumberInvalid')),
      password: z
        .string({
          required_error: t('register.passwordRequired'),
        })
        .min(AuthRules.MIN_LENGTH, {
          message: t('register.minLength', { count: AuthRules.MIN_LENGTH }),
        })
        .max(AuthRules.MAX_LENGTH, {
          message: t('register.maxLength', { count: AuthRules.MAX_LENGTH }),
        })
        .regex(PASSWORD_REGEX, {
          message: t('register.passwordInvalid'),
        }),

      confirmPassword: z.string().min(1, t('register.confirmPasswordRequired')),
      firstName: z
        .string()
        .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.firstNameRequired'))
        .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.firstNameTooLong'))
        .regex(NAME_REGEX, tProfile('profile.firstNameInvalid'))
        .refine((val) => !EMOJI_REGEX.test(val), {
          message: tProfile('profile.firstNameEmojiInvalid'),
        }),

      lastName: z
        .string()
        .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.lastNameRequired'))
        .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.lastNameTooLong'))
        .regex(NAME_REGEX, tProfile('profile.lastNameInvalid'))
        .refine((val) => !EMOJI_REGEX.test(val), {
          message: tProfile('profile.lastNameEmojiInvalid'),
        }),
      role: z.string().min(1, t('register.roleRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.passwordNotMatch'),
      path: ['confirmPassword'],
    })
}

export function useCreateEmployeeSchema() {
  const { t } = useTranslation('auth')
  const { t: tProfile } = useTranslation('profile')
  return z
    .object({
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
      firstName: z
        .string()
        .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.firstNameRequired'))
        .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.firstNameTooLong'))
        .regex(NAME_REGEX, tProfile('profile.firstNameInvalid'))
        .refine((val) => !EMOJI_REGEX.test(val), {
          message: tProfile('profile.firstNameEmojiInvalid'),
        }),

      lastName: z
        .string()
        .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.lastNameRequired'))
        .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.lastNameTooLong'))
        .regex(NAME_REGEX, tProfile('profile.lastNameInvalid'))
        .refine((val) => !EMOJI_REGEX.test(val), {
          message: tProfile('profile.lastNameEmojiInvalid'),
        }),
      role: z.string().min(1, t('register.roleRequired')),
      branch: z.string().min(1, t('register.branchRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.passwordNotMatch'),
      path: ['confirmPassword'],
    })
}

export function useUpdateUserSchema() {
  const { t: tProfile } = useTranslation('profile')
  return z.object({
    slug: z.string(),
    firstName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.firstNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.firstNameTooLong'))
      .regex(NAME_REGEX, tProfile('profile.firstNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.firstNameEmojiInvalid'),
      }),

    lastName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.lastNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.lastNameTooLong'))
      .regex(NAME_REGEX, tProfile('profile.lastNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.lastNameEmojiInvalid'),
      }),
    dob: z
      .string({
        required_error: tProfile('profile.dobRequired'),
        invalid_type_error: tProfile('profile.dobInvalid'),
      })
      .min(1, tProfile('profile.dobRequired'))
      .refine(
        (val) => {
          const date = new Date(val)
          return !isNaN(date.getTime())
        },
        {
          message: tProfile('profile.dobInvalid'),
        },
      ),
    email: z
      .string()
      .min(1, {
        message: tProfile('profile.emailRequired'),
      })
      .email({ message: tProfile('profile.emailInvalid') }),
    address: z
      .string()
      .min(1, tProfile('profile.addressRequired'))
      .max(AuthRules.MAX_ADDRESS_LENGTH, tProfile('profile.addressTooLong'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.addressEmojiInvalid'),
      }),
    branch: z.string().optional(),
  })
}

export function useUpdateEmployeeSchema() {
  const { t: tProfile } = useTranslation('profile')
  return z.object({
    slug: z.string(),
    firstName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.firstNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.firstNameTooLong'))
      .regex(NAME_REGEX, tProfile('profile.firstNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.firstNameEmojiInvalid'),
      }),

    lastName: z
      .string()
      .min(AuthRules.MIN_NAME_LENGTH, tProfile('profile.lastNameRequired'))
      .max(AuthRules.MAX_NAME_LENGTH, tProfile('profile.lastNameTooLong'))
      .regex(NAME_REGEX, tProfile('profile.lastNameInvalid'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.lastNameEmojiInvalid'),
      }),

    dob: z
      .string({
        required_error: tProfile('profile.dobRequired'),
        invalid_type_error: tProfile('profile.dobInvalid'),
      })
      .min(1, tProfile('profile.dobRequired'))
      .refine(
        (val) => {
          const date = new Date(val)
          return !isNaN(date.getTime())
        },
        {
          message: tProfile('profile.dobInvalid'),
        },
      ),

    email: z
      .string()
      .min(1, {
        message: tProfile('profile.emailRequired'),
      })
      .email({ message: tProfile('profile.emailInvalid') }),
    address: z
      .string()
      .min(1, tProfile('profile.addressRequired'))
      .max(AuthRules.MAX_ADDRESS_LENGTH, tProfile('profile.addressTooLong'))
      .refine((val) => !EMOJI_REGEX.test(val), {
        message: tProfile('profile.addressEmojiInvalid'),
      }),

    branch: z.string().optional(),
  })
}

export type TUserInfoSchema = z.infer<typeof userInfoSchema>
export type TUserRoleSchema = z.infer<typeof userRoleSchema>
export type TCreateUserSchema = z.infer<ReturnType<typeof useCreateUserSchema>>
export type TCreateEmployeeSchema = z.infer<
  ReturnType<typeof useCreateEmployeeSchema>
>
export type TUpdateUserSchema = z.infer<ReturnType<typeof useUpdateUserSchema>>
export type TUpdateEmployeeSchema = z.infer<
  ReturnType<typeof useUpdateEmployeeSchema>
>
