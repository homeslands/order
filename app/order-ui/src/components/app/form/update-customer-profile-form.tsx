import React from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
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
} from '@/components/ui'
import { updateProfileSchema, TUpdateProfileSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateProfileRequest, IUserInfo } from '@/types'
import { useUpdateProfile } from '@/hooks'
import { showToast } from '@/utils'
import { DatePicker } from '@/components/app/picker'
import { useUserStore } from '@/stores'
import { getProfile } from '@/api'

interface IFormUpdateProfileProps {
  userProfile?: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateCustomerProfileForm: React.FC<IFormUpdateProfileProps> = ({
  userProfile,
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['profile'])
  const { setUserInfo } = useUserStore()
  const { mutate: createProductVariant } = useUpdateProfile()
  const form = useForm<TUpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      dob: userProfile?.dob || '',
      address: userProfile?.address || '',
    },
  })

  const handleSubmit = (data: IUpdateProfileRequest) => {
    createProductVariant(data, {
      onSuccess: () => {
        getProfile().then((data) => {
          setUserInfo(data.result)
        })
        queryClient.invalidateQueries({
          queryKey: ['profile'],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateProfileSuccess'))
      },
    })
  }

  const formFields = {
    firstName: (
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.firstName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterFirstName')} />
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
            <FormLabel>{t('profile.lastName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterLastName')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    dob: (
      <FormField
        control={form.control}
        name="dob"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.dob')}</FormLabel>
            <FormControl>
              <DatePicker
                date={field.value}
                onSelect={(selectedDate) => {
                  field.onChange(selectedDate)
                }}
                validateDate={() => {
                  return true // Thay thế bằng logic xác thực thực tế của bạn
                }}
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
            <FormLabel>{t('profile.email')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterEmail')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    address: (
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.address')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterAddress')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-2 px-5">
          {Object.keys(formFields).map((key) => (
            <React.Fragment key={key}>
              {formFields[key as keyof typeof formFields]}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-end px-6">
          <Button className="flex justify-end" type="submit">
            {t('profile.update')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
