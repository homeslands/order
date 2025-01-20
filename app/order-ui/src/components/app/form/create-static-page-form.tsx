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
import { useCreateStaticPage } from '@/hooks'
import { staticPageSchema, TStaticPageSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateStaticPage } from '@/types'
import { showToast } from '@/utils'

interface IFormCreateStaticPageProps {
  // content: string
  onSubmit: (isOpen: boolean) => void
}

export const CreateStaticPageForm: React.FC<IFormCreateStaticPageProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['staticPage'])
  const { mutate: createStaticPage } = useCreateStaticPage()

  const form = useForm<TStaticPageSchema>({
    resolver: zodResolver(staticPageSchema),
    defaultValues: {
      key: '',
      title: '',
      content: '',
    },
  })

  const handleSubmit = (data: ICreateStaticPage) => {
    createStaticPage(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['staticPages'],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createStaticPageSuccess'))
      },
    })
  }

  const formFields = {
    key: (
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('staticPage.key')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('staticPage.enterKey')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('staticPage.title')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('staticPage.enterTitle')}
              />
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
          <div className='flex flex-col gap-6'>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {t('staticPage.warning')}
            </span>
          </div>
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('staticPage.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
