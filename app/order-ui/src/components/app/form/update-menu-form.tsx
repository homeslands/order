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
} from '@/components/ui'
import { updateMenuSchema, TUpdateMenuSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateMenuRequest, IMenu } from '@/types'
import { useUpdateMenu } from '@/hooks'
import { showToast } from '@/utils'
import { BranchSelect } from '@/components/app/select'
import { cn } from '@/lib'
import { useUserStore } from '@/stores'
import moment from 'moment'
import { IsTemplateSwitch } from '@/components/app/switch'

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
  const { userInfo } = useUserStore()
  const { mutate: updateMenu } = useUpdateMenu()
  const form = useForm<TUpdateMenuSchema>({
    resolver: zodResolver(updateMenuSchema),
    defaultValues: {
      slug: menu.slug,
      date: menu.date,
      isTemplate: menu.isTemplate,
      branchSlug: userInfo?.branch.slug,
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
              <Input
                {...field}
                value={moment(field.value).format('DD/MM/YYYY') || ''}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !field.value && 'text-muted-foreground',
                )}
              />
              {/* <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {field.value ? (
                        field.value
                      ) : (
                        <span>{t('menu.chooseDate')}</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        const formattedDate =
                          moment(newDate).format('YYYY-MM-DD')
                        setDate(newDate)
                        field.onChange(formattedDate)
                      }
                    }}
                    disabled
                    modifiersClassNames={{
                      booked:
                        'relative before:absolute before:bottom-0.5 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full',
                    }}
                  />
                </PopoverContent>
              </Popover> */}
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
                defaultValue={userInfo?.branch.slug} // Giá trị mặc định
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
