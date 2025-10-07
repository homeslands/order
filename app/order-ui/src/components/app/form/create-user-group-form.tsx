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
  Input,
  ScrollArea,
} from '@/components/ui'
import { useCreateUserGroup } from '@/hooks'
import { TCreateUserGroupSchema, useCreateUserGroupSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateUserGroupRequest } from '@/types'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormCreateUserGroupProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateUserGroupForm: React.FC<IFormCreateUserGroupProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { mutate: createUserGroup } = useCreateUserGroup()


  const form = useForm<TCreateUserGroupSchema>({
    resolver: zodResolver(useCreateUserGroupSchema()),
    defaultValues: {
      name: '',
      description: '',
    },
  })


  const handleSubmit = (data: ICreateUserGroupRequest) => {
    createUserGroup(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.userGroups],
          exact: false,
          refetchType: 'all'
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createUserGroupSuccess'))
      },
    })
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <span className="pr-1 text-destructive">*</span>
            <FormLabel>{t('customer.userGroup.name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.userGroup.enterName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    description: (
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.userGroup.description')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.userGroup.enterDescription')} {...field} />
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
        <form id='create-user-group-form' onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ScrollArea className="px-2">
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
