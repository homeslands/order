import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import moment from 'moment'
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
import { useAllMenus, usePagination, useCreateMenu } from '@/hooks'
import { createMenuSchema, TCreateMenuSchema } from '@/schemas'
import { SimpleDatePicker } from '@/components/app/picker'
import { ICreateMenuRequest } from '@/types'
import { showToast } from '@/utils'
import { BranchSelect } from '@/components/app/select'
import { IsTemplateSwitch } from '@/components/app/switch'
import { useUserStore } from '@/stores'
import { zodResolver } from '@hookform/resolvers/zod'

interface IFormCreateMenuProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateMenuForm: React.FC<IFormCreateMenuProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { userInfo } = useUserStore()
  const { mutate: createMenu } = useCreateMenu()
  const { pagination } = usePagination()
  const { data: menuData } = useAllMenus({
    order: 'DESC',
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    branch: userInfo?.branch.slug,
  })

  const form = useForm<TCreateMenuSchema>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      date: '',
      branchSlug: userInfo?.branch.slug,
      isTemplate: false,
    },
  })

  // Get existing menu dates
  const existingMenuDates = useMemo(() => {
    return menuData?.result.items.map((menu) =>
      moment(menu.date).format('YYYY-MM-DD')
    ) || []
  }, [menuData])

  console.log('existingMenuDates', existingMenuDates)

  const disabledDates = (date: Date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD')
    return existingMenuDates.includes(formattedDate)
  }

  const handleSubmit = (data: ICreateMenuRequest) => {
    createMenu(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['menus'],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createMenuSuccess'))
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
                disabledDates={disabledDates}
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
              <BranchSelect {...field} />
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
              <IsTemplateSwitch defaultValue={false} {...field} />
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
              {t('menu.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
