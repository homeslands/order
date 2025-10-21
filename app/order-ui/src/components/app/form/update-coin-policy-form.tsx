import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ControllerRenderProps, useForm } from 'react-hook-form'
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

import { zodResolver } from '@hookform/resolvers/zod'
import { ICoinPolicy, IUpdateCoinPolicy } from '@/types/coin-policy.type'
import { TUpdateCoinPolicySchema, updateCoinPolicySchema } from '@/schemas/coin-policy.schema'
import { useUpdateCoinPolicy } from '@/hooks/use-coin-policies'
import { showToast } from '@/utils'
import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { CoinPolicyConstants } from '@/constants/coin-policy'

interface IUpdateCoinPolicyFormProps {
  data: ICoinPolicy | null
  onSubmit: (isOpen: boolean) => void
}

export const UpdateCoinPolicyForm: React.FC<IUpdateCoinPolicyFormProps> = ({
  data,
  onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['giftCard', 'common'])

  const { mutate: updateCoinPolicyMutation } = useUpdateCoinPolicy();

  const form = useForm<TUpdateCoinPolicySchema>({
    resolver: zodResolver(updateCoinPolicySchema),
    defaultValues: {
      slug: data?.slug,
      value: data?.value
    },
  })

  const handleSubmit = () => {
    const formVal = form.getValues();
    const request: { slug: string; payload: IUpdateCoinPolicy } = {
      slug: formVal.slug,
      payload: { value: formVal.value }
    }
    updateCoinPolicyMutation(request, {
      onSuccess: () => {
        form.reset()
        onSubmit(false)
        queryClient.invalidateQueries({
          queryKey: ['coin-policies'],
        })
        showToast(t('toast.updateCoinPolicySuccess'))
      },
    })
  }

  const renderInput = (field: ControllerRenderProps<{
    slug: string;
    value: string;
  }, "value">) => {
    switch (data?.key) {
      case CoinPolicyConstants.MAX_BALANCE:
        return (
          <NumericFormat
            thousandSeparator
            allowNegative={false}
            customInput={Input}
            placeholder={t('giftCard.coinPolicy.enterValue')}
            className='text-sm'
            onValueChange={(values: NumberFormatValues) => {
              const val = values.floatValue ?? 0;
              field.onChange(val.toString())
            }}
          />
        )
      default:
        return (
          <Input {...field} placeholder={t('giftCard.coinPolicy.enterValue')} className='text-sm' />
        )
    }
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel className='required-input'>{t('giftCard.coinPolicy.label')}</FormLabel>
              <FormControl>
                {renderInput(field)}
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
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
              {t('giftCard.coinPolicy.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
