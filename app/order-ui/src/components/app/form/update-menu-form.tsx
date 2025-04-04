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
} from '@/components/ui'
import { updateMenuSchema, TUpdateMenuSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateMenuRequest, IMenu } from '@/types'
import { useUpdateMenu } from '@/hooks'
import { showToast } from '@/utils'
import { BranchSelect } from '@/components/app/select'
import { IsTemplateSwitch } from '@/components/app/switch'
import { SimpleDatePicker } from '../picker'

interface IFormUpdateMenuProps {
  menu: IMenu
  onSubmit: (isOpen: boolean) => void
}

export const UpdateMenuForm: React.FC<IFormUpdateMenuProps> = ({
  menu,
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { mutate: updateMenu } = useUpdateMenu()
  const form = useForm<TUpdateMenuSchema>({
    resolver: zodResolver(updateMenuSchema),
    defaultValues: {
      slug: menu.slug,
      date: menu.date,
      isTemplate: menu.isTemplate,
      branchSlug: menu.branchSlug,
    },
  })
  const handleSubmit = (data: IUpdateMenuRequest) => {
    updateMenu(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['menus'],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateMenuSuccess'))
      },
    })
  }

  const formFields = {
    date: (
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('menu.date')}</FormLabel>
            <FormControl>
              <SimpleDatePicker
                value={field.value}
                onChange={(date) => field.onChange(date)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    branchSlug: (
      <FormField
        control={form.control}
        name="branchSlug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('menu.branchSlug')}</FormLabel>
            <FormControl>
              <BranchSelect
                defaultValue={menu.branchSlug} // Giá trị mặc định
                onChange={field.onChange} // Cập nhật giá trị
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    isTemplate: (
      <FormField
        control={form.control}
        name="isTemplate"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <IsTemplateSwitch defaultValue={menu.isTemplate} {...field} />
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
              {t('menu.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
