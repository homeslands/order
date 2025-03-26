import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button
} from '@/components/ui'
import { TUpdateChefAreaSchema, updateChefAreaSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IChefArea, IUpdateChefAreaRequest } from '@/types'
import { useUpdateChefArea } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormUpdateChefAreaProps {
  chefArea: IChefArea
  onSubmit: (isOpen: boolean) => void
}

export const UpdateChefAreaForm: React.FC<IFormUpdateChefAreaProps> = ({ chefArea, onSubmit }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { mutate: updateChefArea } = useUpdateChefArea()
  const form = useForm<TUpdateChefAreaSchema>({
    resolver: zodResolver(updateChefAreaSchema),
    defaultValues: {
      slug: chefArea.slug,
      name: chefArea.name || '',
      branch: chefArea.branch.slug || '',
      description: chefArea.description || ''
    }
  })

  const handleSubmit = (data: IUpdateChefAreaRequest) => {
    updateChefArea(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefAreas],
          exact: false,
          refetchType: 'all'
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateChefAreaSuccess'))
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
            <FormLabel>{t('chefArea.name')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('chefArea.enterName')} />
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
            <FormLabel>{t('chefArea.description')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('chefArea.enterDescription')} />
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
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('chefArea.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
