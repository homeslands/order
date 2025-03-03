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
  Button,
  ScrollArea,
} from '@/components/ui'
import { updateProfileSchema, TUpdateProfileSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateProfileRequest, IUserInfo } from '@/types'
import { useUpdateProfile } from '@/hooks'
import { showToast } from '@/utils'
import { BranchSelect } from '@/components/app/select'
import { DatePicker } from '@/components/app/picker'
import { useUserStore } from '@/stores'
import { getProfile } from '@/api'
import { useQueryClient } from '@tanstack/react-query'

interface IFormUpdateProfileProps {
  userProfile?: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateProfileForm: React.FC<IFormUpdateProfileProps> = ({
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
      // email: userProfile?.email || '',
      dob: userProfile?.dob || '',
      address: userProfile?.address || '',
      branch: userProfile?.branch?.slug || '',
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
    // email: (
    //   <FormField
    //     control={form.control}
    //     name="email"
    //     render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{t('profile.email')}</FormLabel>
    //         <FormControl>
    //           <Input {...field} placeholder={t('profile.enterEmail')} />
    //         </FormControl>
    //         <FormMessage />
    //       </FormItem>
    //     )}
    //   />
    // ),
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
    branch: (
      <FormField
        control={form.control}
        name="branch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.branch')}</FormLabel>
            <FormControl>
              <BranchSelect onChange={field.onChange} />
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
          <ScrollArea className="h-[22rem] flex-1 px-6">
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end px-6">
            <Button className="flex justify-end" type="submit">
              {t('profile.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
