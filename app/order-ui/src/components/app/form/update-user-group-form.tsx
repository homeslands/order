import React from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

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
import { TUpdateUserGroupSchema, useUpdateUserGroupSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { IUserGroup } from '@/types'
import { useUpdateUserGroup } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormUpdateUserGroupProps {
  userGroup: IUserGroup
  onSubmit: (isOpen: boolean) => void
}

export const UpdateUserGroupForm: React.FC<IFormUpdateUserGroupProps> = ({
  userGroup, onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { mutate: updateUserGroup, isPending } = useUpdateUserGroup()
  const form = useForm<TUpdateUserGroupSchema>({
    resolver: zodResolver(useUpdateUserGroupSchema()),
    defaultValues: {
      slug: userGroup.slug,
      name: userGroup.name,
      description: userGroup.description || '',
    },
  })

  const handleSubmit = (data: TUpdateUserGroupSchema) => {
    updateUserGroup(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.userGroups],
          exact: false,
          refetchType: 'all'
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateUserGroupSuccess'))
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
            <FormLabel>
              <span className="pr-1 text-destructive">*</span>
              {t('customer.userGroup.name')}
            </FormLabel>
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
            <FormLabel>
              {t('customer.userGroup.description')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('customer.userGroup.enterDescription')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ScrollArea className="flex-1 pr-4 pb-4">
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
              {isPending ? <div className="flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('customer.userGroup.update')}
              </div> : t('customer.userGroup.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
