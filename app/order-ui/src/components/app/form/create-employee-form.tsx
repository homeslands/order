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
import { useCreateEmployeeSchema, TCreateEmployeeSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateUserRequest } from '@/types'
import { showToast } from '@/utils'
import { BranchSelect, RoleSelect } from '../select'
import { PasswordWithRulesInput } from '../input'

interface IFormCreateEmployeeProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateEmployeeForm: React.FC<IFormCreateEmployeeProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['employee'])
  const { mutate: createUser } = useCreateUser()

  const form = useForm<TCreateEmployeeSchema>({
    resolver: zodResolver(useCreateEmployeeSchema()),
    defaultValues: {
      phonenumber: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      branch: '',
      role: '',
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
            <FormLabel>{t('employee.phoneNumber')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('employee.enterPhoneNumber')}
                {...field}
                onChange={(e) => {
                  // Chỉ giữ lại các ký tự là số
                  const onlyNumbers = e.target.value.replace(/\D/g, '')
                  field.onChange(onlyNumbers) // Gán lại cho field dạng string
                }}
                inputMode="numeric" // Gợi ý bàn phím số trên mobile
                pattern="[0-9]*"     // Gợi ý trình duyệt chỉ cho nhập số
              />
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
              {t('employee.password')}
            </FormLabel>
            <FormControl>
              <PasswordWithRulesInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('employee.enterPassword')}
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
              {t('employee.confirmPassword')}
            </FormLabel>
            <FormControl>
              <PasswordInput
                placeholder={t('employee.enterPassword')}
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
              <RoleSelect {...field} />
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
              <BranchSelect {...field} />
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ScrollArea className="h-[400px] px-2">
            <div className="grid grid-cols-1 gap-4 p-2">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end p-4 border-t">
            <Button className="flex justify-end" type="submit">
              {t('employee.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
