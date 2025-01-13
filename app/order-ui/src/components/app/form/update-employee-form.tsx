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
import { BranchSelect, RoleSelect } from '../select'

interface IFormUpdateEmployeeProps {
  employee: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateEmployeeForm: React.FC<IFormUpdateEmployeeProps> = ({
  employee
}) => {
  // const queryClient = useQueryClient()
  const { t } = useTranslation(['employee'])
  // const { mutate: createUser } = useCreateUser()

  const form = useForm<TUpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      phonenumber: employee.phonenumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      branch: employee.branch.slug,
      role: employee.role.slug,
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
            <FormLabel>{t('employee.phoneNumber')}</FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterPhoneNumber')} {...field} />
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
            <FormLabel>{t('employee.firstName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterFirstName')} {...field} />
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
            <FormLabel>{t('employee.lastName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterLastName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    role: (
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('employee.role')}</FormLabel>
            <FormControl>
              <RoleSelect defaultValue={employee.role.slug} {...field} />
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
            <FormLabel>{t('employee.branch')}</FormLabel>
            <FormControl>
              <BranchSelect defaultValue={employee.branch.slug} {...field} />
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
              {t('employee.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
