import React from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button,
} from '@/components/ui'
import {
  createProductVariantSchema,
  TCreateProductVariantSchema,
} from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateProductVariantRequest } from '@/types'
import { useCreateProductVariant } from '@/hooks'
import { showToast } from '@/utils'
import { SizeSelect } from '@/components/app/select'
import { QUERYKEY } from '@/constants'

interface IFormCreateProductVariantProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateProductVariantForm: React.FC<
  IFormCreateProductVariantProps
> = ({ onSubmit }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { slug } = useParams()
  const { mutate: createProductVariant } = useCreateProductVariant()
  const form = useForm<TCreateProductVariantSchema>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      price: 0,
      size: '',
      product: slug,
    },
  })

  const handleSubmit = (data: ICreateProductVariantRequest) => {
    createProductVariant(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.specificProduct, slug],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createProductVariantSuccess'))
      },
    })
  }

  const formFields = {
    price: (
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('product.price')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                placeholder={t('product.enterPrice')}
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value))} // Chuyển đổi giá trị thành số
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    size: (
      <FormField
        control={form.control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('product.size')}</FormLabel>
            <FormControl>
              <SizeSelect {...field} />
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
              {t('product.createVariant')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
