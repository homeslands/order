import React from 'react'
import { useForm } from 'react-hook-form'
// import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  Button,
  Input,
} from '@/components/ui'
// import { useCreateUser } from '@/hooks'
import { updateUserSchema, TUpdateUserSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateUserRequest, IUserInfo } from '@/types'
// import { showToast } from '@/utils'
// import { BranchSelect, RoleSelect } from '../select'

interface IFormUpdateCustomerProps {
  customer: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateCustomerForm: React.FC<IFormUpdateCustomerProps> = ({
  customer
}) => {
  // const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  // const { mutate: createUser } = useCreateUser()

  const form = useForm<TUpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      phonenumber: customer.phonenumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
  })

  const handleSubmit = (data: IUpdateUserRequest) => {
    console.log(data)
    // createUser(data, {
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({
    //       queryKey: ['users'],
    //     })
    //     onSubmit(false)
    //     form.reset()
    //     showToast(t('toast.updateUserSuccess'))
    //   },
    // })
  }

  const formFields = {
    phonenumber: (
      <FormField
        control={form.control}
        name="phonenumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.phoneNumber')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterPhoneNumber')} {...field} />
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
            <FormLabel>{t('customer.firstName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterFirstName')} {...field} />
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
            <FormLabel>{t('customer.lastName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterLastName')} {...field} />
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
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('customer.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
