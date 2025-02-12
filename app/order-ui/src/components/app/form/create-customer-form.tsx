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
  Form,
  Button,
  Input,
  PasswordInput,
  ScrollArea,
} from '@/components/ui'
import { useCreateUser } from '@/hooks'
import { createUserSchema, TCreateUserSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateUserRequest } from '@/types'
import { showToast } from '@/utils'
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

  const form = useForm<TCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      phonenumber: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: Role.CUSTOMER,
    },
  })

  const handleSubmit = (data: ICreateUserRequest) => {
    createUser(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['users'],
        })
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
            <FormLabel>{t('customer.phoneNumber')}</FormLabel>
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
            <FormLabel>{t('customer.password')}</FormLabel>
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
    confirmPassword: (
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.confirmPassword')}</FormLabel>
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
    <div className="flex flex-col h-full max-h-[600px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ScrollArea className="h-[400px] px-2">
            <div className="grid grid-cols-1 gap-4 px-1">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit">
              {t('customer.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
