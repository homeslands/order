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
  Input,
  Form,
  Button,
} from '@/components/ui'
import {
  useUpdateProductVariantSchema,
  TUpdateProductVariantSchema,
} from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateProductVariantRequest, IProductVariant } from '@/types'
import { useUpdateProductVariant } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useParams } from 'react-router-dom'

interface IFormUpdateProductVariantProps {
  productVariant: IProductVariant
  onSubmit: (isOpen: boolean) => void
}

export const UpdateProductVariantForm: React.FC<
  IFormUpdateProductVariantProps
> = ({ productVariant, onSubmit }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { slug } = useParams()
  const { mutate: createProductVariant } = useUpdateProductVariant()
  const form = useForm<TUpdateProductVariantSchema>({
    resolver: zodResolver(useUpdateProductVariantSchema()),
    defaultValues: {
      price: productVariant.price,
      product: productVariant.slug,
    },
  })

  const handleSubmit = (data: IUpdateProductVariantRequest) => {
    createProductVariant(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.specificProduct, slug],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateProductVariantSuccess'))
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
              <div className="flex relative items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('product.enterPrice')}
                  value={
                    field.value === 0
                      ? '0'
                      : field.value
                        ? field.value.toLocaleString()
                        : ''
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '') // bỏ dấu phẩy
                    const num = raw === '' ? '' : Number(raw)
                    if (num === '' || !isNaN(num)) {
                      field.onChange(num === '' ? '' : num)
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()} // tránh scroll đổi số
                  className="pr-8 font-medium tracking-wide text-right"
                />
                <span className="absolute right-2 text-muted-foreground">₫</span>
              </div>
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
              {t('productVariant.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
