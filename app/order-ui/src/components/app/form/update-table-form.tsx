import React, { useEffect, useState } from 'react'
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
import { updateTableSchema, TUpdateTableSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateTableRequest, ITable } from '@/types'
import { useUpdateTable } from '@/hooks'
import { showToast } from '@/utils'
import TableLocationSelect from '../select/table-location-select'
import { QUERYKEY } from '@/constants'

interface IFormUpdateTableProps {
  table: ITable | null
  onSubmit: (isOpen: boolean) => void
}

export const UpdateTableForm: React.FC<IFormUpdateTableProps> = ({
  table,
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['table'])
  const { mutate: updateTable } = useUpdateTable()
  const [hasLocation, setHasLocation] = useState(false)
  const form = useForm<TUpdateTableSchema>({
    resolver: zodResolver(updateTableSchema),
    defaultValues: {
      slug: table?.slug,
      name: table?.name,
      location: table?.location || '',
    },
  })
  useEffect(() => {
    setHasLocation(table?.location ? true : false)
  }, [table])

  const handleSubmit = (data: IUpdateTableRequest) => {
    updateTable(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.tables],
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateTableSuccess'))
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
              <TableLocationSelect defaultValue={table?.location} {...field} />
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
              {t('table.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
