import React from 'react'
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
} from '@/components/ui'
import { userInfoSchema, TUserInfoSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUserInfo } from '@/types'

interface IFormUserInfoProps {
  user?: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UserInfoForm: React.FC<IFormUserInfoProps> = ({ user }) => {
  const { t } = useTranslation(['user'])
  const form = useForm<TUserInfoSchema>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      slug: user?.slug,
      firstName: user?.firstName,
      lastName: user?.lastName,
      dob: user?.dob,
      email: user?.email,
      address: user?.address,
      branch: user?.branch?.name,
    },
  })

  const formFields = {
    slug: (
      <FormField
        disabled={true}
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.slug')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    firstName: (
      <FormField
        disabled={true}
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.firstName')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    lastName: (
      <FormField
        disabled={true}
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.lastName')}</FormLabel>
            <FormControl className="flex items-center p-0">
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    dob: (
      <FormField
        disabled={true}
        control={form.control}
        name="dob"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.dob')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    email: (
      <FormField
        disabled={true}
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.email')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    address: (
      <FormField
        disabled={true}
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.address')}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    branch: (
      <FormField
        disabled={true}
        control={form.control}
        name="branch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('users.branch')}</FormLabel>
            <FormControl>
              <Input {...field} />
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
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
        </form>
      </Form>
    </div>
  )
}
