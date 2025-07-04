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
  ScrollArea,
} from '@/components/ui'
// import { useCreateUser } from '@/hooks'
import { TUpdateEmployeeSchema, useUpdateEmployeeSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateUserRequest, IUserInfo } from '@/types'
// import { showToast } from '@/utils'
import { BranchSelect } from '../select'
import { useUpdateUser } from '@/hooks'
import { showToast } from '@/utils'
import { DatePicker } from '../picker'
import { useUserStore } from '@/stores'
import { Role } from '@/constants'
import { Loader2 } from 'lucide-react'

interface IFormUpdateEmployeeProps {
  employee: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateEmployeeForm: React.FC<IFormUpdateEmployeeProps> = ({
  employee, onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['employee'])
  const { mutate: updateUser, isPending } = useUpdateUser()
  const { userInfo } = useUserStore()
  const form = useForm<TUpdateEmployeeSchema>({
    resolver: zodResolver(useUpdateEmployeeSchema()),
    defaultValues: {
      slug: employee.slug,
      // phonenumber: employee.phonenumber,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      dob: employee.dob || undefined,
      email: employee.email || '',
      address: employee?.address || '',
      branch: employee?.branch?.slug || '',
    },
  })

  const handleSubmit = (data: IUpdateUserRequest) => {
    updateUser(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['users'],
          exact: false,
          refetchType: 'all'
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateUserSuccess'))
      },
    })
  }

  const formFields = {
    // phonenumber: (
    //   <FormField
    //     control={form.control}
    //     name="phonenumber"
    //     render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{t('employee.phoneNumber')}</FormLabel>
    //         <FormControl>
    //           <Input placeholder={t('employee.enterPhoneNumber')} {...field} />
    //         </FormControl>
    //         <FormMessage />
    //       </FormItem>
    //     )}
    //   />
    // ),
    firstName: (
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('employee.firstName')}
            </FormLabel>
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('employee.lastName')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterLastName')} {...field} />
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('employee.dob')}
            </FormLabel>
            <FormControl>
              <DatePicker
                date={field.value}
                onSelect={(selectedDate) => {
                  field.onChange(selectedDate)
                }}
                validateDate={(date) => date <= new Date()}
                disableFutureDate
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('employee.email')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterEmail')} {...field} />
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('employee.address')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('employee.enterAddress')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    branch: (
      userInfo?.role?.name === Role.SUPER_ADMIN || userInfo?.role?.name === Role.ADMIN) && (
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="pr-1 text-destructive">*</span>
                {t('employee.branch')}
              </FormLabel>
              <FormControl>
                <BranchSelect defaultValue={employee?.branch?.slug} {...field} />
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
          <ScrollArea className="h-[22rem] flex-1 pr-4 pb-4">
            <div className="grid grid-cols-1 gap-2 px-1">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button disabled={isPending} className="flex justify-end" type="submit">
              {isPending ? <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('employee.update')}
              </div> : t('employee.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
