import React from 'react'
import { useForm } from 'react-hook-form'
// import { useQueryClient } from '@tanstack/react-query'
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
import { useUpdateStaticPage } from '@/hooks'
import { updateStaticPageSchema, TUpdateStaticPageSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateStaticPage } from '@/types'
import { showToast } from '@/utils'

interface IFormUpdateStaticPageProps {
  staticPageData: {
    slug: string;
    key: string;
    title: string;
    content: string;
  };
  onSubmit: (isOpen: boolean) => void;
  onCompleted?: () => void;
}

export const UpdateStaticPageForm: React.FC<IFormUpdateStaticPageProps> = ({
  staticPageData,
  onSubmit,
  onCompleted,
}) => {
  // const queryClient = useQueryClient()
  const { t } = useTranslation(['staticPage'])
  const { mutate: updateStaticPage } = useUpdateStaticPage()

  const form = useForm<TUpdateStaticPageSchema>({
    resolver: zodResolver(updateStaticPageSchema),
    defaultValues: {
      slug: staticPageData.slug,
      key: staticPageData.key,
      title: staticPageData.title,
      content: staticPageData.content,
    },
  })

  const handleSubmit = (formData: TUpdateStaticPageSchema) => {
    const updateData: IUpdateStaticPage = {
      slug: formData.slug,
      key: formData.key,
      title: formData.title,
      content: formData.content,
    };

    updateStaticPage(updateData, {
      onSuccess: () => {
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateStaticPageSuccess'))
        if (onCompleted) {
          onCompleted()
        }
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
          {/* <ScrollArea className=""> */}
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
          {/* </ScrollArea> */}
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('staticPage.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
