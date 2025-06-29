import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  Input,
  PasswordInput,
  ScrollArea,
} from '@/components/ui'
import { useCreateUser, useRoles } from '@/hooks'
import { TCreateUserSchema, useCreateUserSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateUserRequest } from '@/types'
import { showToast } from '@/utils'
import { PasswordWithRulesInput } from '../input'
import { useCartItemStore } from '@/stores'
import { Role } from '@/constants'

interface IFormCreateCustomerProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateCustomerForm: React.FC<IFormCreateCustomerProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { mutate: createUser } = useCreateUser()
  const { data } = useRoles()
  const { addCustomerInfo } = useCartItemStore()


  // get slug of role customer
  const customerRole = data?.result.find((role) => role.name === Role.CUSTOMER)

  const form = useForm<TCreateUserSchema>({
    resolver: zodResolver(useCreateUserSchema()),
    defaultValues: {
      phonenumber: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: '',
    },
  })


  useEffect(() => {
    if (customerRole) {
      form.setValue('role', customerRole.slug)
    }
  }, [customerRole, form])

  const handleSubmit = (data: ICreateUserRequest) => {
    createUser(data, {
      onSuccess: (response) => {
        queryClient.invalidateQueries({
          queryKey: ['users'],
          exact: false,
          refetchType: 'all'
        })
        if (response?.result) {
          addCustomerInfo(response.result)
        }
        onSubmit(false)
        form.reset()
        showToast(t('toast.createUserSuccess'))
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('customer.phoneNumber')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterPhoneNumber')} {...field} />
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('customer.password')}
            </FormLabel>
            <FormControl>
              <PasswordWithRulesInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('customer.enterPassword')}
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('customer.confirmPassword')}
            </FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={t('customer.enterPassword')}
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
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form id='create-customer-form' onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ScrollArea className="h-[400px] px-2">
            <div className="grid grid-cols-1 gap-4 p-2">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </form>
      </Form>
    </div>
  )
}
