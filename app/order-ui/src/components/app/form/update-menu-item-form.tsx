import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button,
  Label,
  Switch,
} from '@/components/ui'
import { updateMenuItemSchema, TUpdateMenuItemSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateMenuItemRequest, IMenuItem } from '@/types'
import { useUpdateMenuItem } from '@/hooks'
import { showToast } from '@/utils'

interface IFormUpdateMenuItemProps {
  menuItem: IMenuItem
  isTemplate: boolean
  onSubmit: (isOpen: boolean) => void
}

export const UpdateMenuItemForm: React.FC<IFormUpdateMenuItemProps> = ({
  menuItem,
  isTemplate,
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { slug } = useParams()
  const { mutate: updateMenuItem } = useUpdateMenuItem()

  const form = useForm<TUpdateMenuItemSchema>({
    resolver: zodResolver(updateMenuItemSchema),
    defaultValues: {
      slug: menuItem.slug,
      menuSlug: slug,
      productSlug: menuItem.slug,
      productName: menuItem.product.name,
      defaultStock: menuItem?.defaultStock || 0,
      isLocked: menuItem.isLocked,
      isResetCurrentStock: isTemplate,
    },
  })

  const handleSubmit = (data: IUpdateMenuItemRequest) => {
    updateMenuItem(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['specific-menu'],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateMenuItemSuccess'))
      },
    })
  }

  const formFields = {
    productName: (
      <FormField
        control={form.control}
        name="productName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('menu.productName')}</FormLabel>
            <FormControl>
              <Input
                readOnly
                {...field}
                placeholder={t('menu.enterProductName')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    defaultStock: (
      menuItem?.product?.isLimit && <FormField
        control={form.control}
        name="defaultStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('menu.defaultStock')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={form.watch('defaultStock')}
                {...field}
                placeholder={t('menu.defaultStockDescription')}
                onChange={(e) => { form.setValue("defaultStock", +e.target.value) }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    isLocked: (
      !isTemplate && <FormField
        control={form.control}
        name="isLocked"
        render={() => (
          <FormItem className="flex items-center gap-4">
            <FormControl className="flex items-center">
              <div className="flex items-center gap-4 py-2">
                <Label>{t('menu.isLocked')}</Label>
                <Switch defaultChecked={form.watch('isLocked')}
                  onCheckedChange={(checked) => {
                    form.setValue("isLocked", checked)
                  }} />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    )
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
              {t('menu.updateMenuItem')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
