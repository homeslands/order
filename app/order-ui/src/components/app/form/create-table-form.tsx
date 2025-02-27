import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
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
  Switch,
} from '@/components/ui'
import { createTableSchema, TCreateTableSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateTableRequest } from '@/types'
import { useCreateTable } from '@/hooks'
import { showToast } from '@/utils'
import { BranchSelect } from '@/components/app/select'
import { TableStatus } from '@/constants'
import TableLocationSelect from '../select/table-location-select'
import { useUserStore } from '@/stores'

interface IFormCreateTableProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateTableForm: React.FC<IFormCreateTableProps> = ({
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['table'])
  const { userInfo } = useUserStore()
  const { mutate: createTable } = useCreateTable()
  const [hasLocation, setHasLocation] = React.useState(false)
  const form = useForm<TCreateTableSchema>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      name: '',
      branch: '',
      location: '',
      status: TableStatus.AVAILABLE,
    },
  })

  const handleSubmit = (data: ICreateTableRequest) => {
    createTable(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['tables', userInfo?.branch.slug],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.createTableSuccess'))
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
            <FormLabel>{t('table.tableName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('table.enterTableName')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    branch: (
      <FormField
        control={form.control}
        name="branch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('table.branch')}</FormLabel>
            <FormControl>
              <BranchSelect {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    hasLocation: (
      <FormItem className="flex flex-row items-center justify-between py-4">
        <div className="space-y-0.5">
          <FormLabel className="">{t('table.hasLocation')}</FormLabel>
        </div>
        <FormControl>
          <Switch
            checked={hasLocation}
            onCheckedChange={setHasLocation}
          />
        </FormControl>
      </FormItem>
    ),
    location: hasLocation && (
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('table.location')}</FormLabel>
            <FormControl>
              <TableLocationSelect {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    status: (
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('table.status')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={t(`table.${field.value}`)}
                placeholder={t('table.enterStatus')}
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
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(formFields).map((key) => (
              <React.Fragment key={key}>
                {formFields[key as keyof typeof formFields]}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-end">
            <Button className="flex justify-end" type="submit">
              {t('table.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
