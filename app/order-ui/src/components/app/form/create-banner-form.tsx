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
import { useCreateBanner } from '@/hooks'
import { bannerSchema, TBannerSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateBannerRequest } from '@/types'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormCreateBannerProps {
  // content: string
  onSubmit: (isOpen: boolean) => void
}

export const CreateBannerForm: React.FC<IFormCreateBannerProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['banner'])
  const { mutate: createBanner } = useCreateBanner()

  const form = useForm<TBannerSchema>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      content: 'default content',
    },
  })

  const handleSubmit = (data: ICreateBannerRequest) => {
    createBanner(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.banners],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createBannerSuccess'))
      },
    })
  }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('banner.title')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('banner.enterTitle')}
              />
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
          <div className='flex flex-col gap-6'>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('banner.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
