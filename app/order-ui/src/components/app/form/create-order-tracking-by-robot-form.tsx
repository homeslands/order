import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button,
} from '@/components/ui'
import {
  createOrderTrackingByStaffSchema,
  TCreateOrderTrackingByStaffSchema,
} from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateOrderTrackingRequest, IOrder } from '@/types'
import { useCreateOrderTracking } from '@/hooks'
import { showToast } from '@/utils'
import { useOrderStore, useOrderTrackingStore } from '@/stores'
import { Label } from '@radix-ui/react-dropdown-menu'

interface IFormDeliverByRobotProps {
  onPending: (pending: boolean) => void
  onSubmit: (shouldRefetch: boolean) => void
}

export const CreateOrderTrackingByRobotForm: React.FC<
  IFormDeliverByRobotProps
> = ({ onSubmit, onPending }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { mutate: createOrderTracking, isPending } = useCreateOrderTracking()
  const { getSelectedItems, clearSelectedItems } = useOrderTrackingStore()
  const { getOrder, addOrder } = useOrderStore()
  // const { refetch } = useOrderBySlug(getOrder()?.slug as string)

  const form = useForm<TCreateOrderTrackingByStaffSchema>({
    resolver: zodResolver(createOrderTrackingByStaffSchema),

    defaultValues: {
      type: 'by-robot',
      trackingOrderItems: getSelectedItems().map((item) => ({
        quantity: item.quantity,
        orderItem: item.slug,
      })),
      productName: getSelectedItems().map((item) => item.variant.product.name),
      productQuantity: getSelectedItems().map((item) => item.quantity),
    },
  })

  // Đồng bộ onPending với isPending
  useEffect(() => {
    onPending(isPending)
  }, [isPending, onPending])

  const handleSubmit = (data: ICreateOrderTrackingRequest) => {
    createOrderTracking(data, {
      onSuccess: async () => {
        try {
          await queryClient.invalidateQueries({
            queryKey: ['order', getOrder()?.slug],
          })

          const updatedOrderData = queryClient.getQueryData<{ result: IOrder }>(
            ['order', getOrder()?.slug],
          )

          if (updatedOrderData?.result) {
            addOrder(updatedOrderData.result)
          }

          form.reset()
          clearSelectedItems()
          showToast(t('toast.createOrderTrackingSuccess'))
          onSubmit(true) // Trigger refetching
        } catch (error) {
          console.error('Error updating order store:', error)
          showToast('Đã có lỗi xảy ra')
          onSubmit(false)
        }
      },
    })
  }

  const formFields = {
    products: (
      <FormField
        control={form.control}
        name="productName"
        render={() => (
          <FormItem>
            <FormControl>
              <div className="space-y-2">
                {form.getValues('productName').map((name, index) => (
                  <div
                    key={`product-row-${index}`}
                    className="grid grid-cols-5 gap-4 text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col col-span-3 gap-1">
                      <Label>{t('order.productName')}</Label>
                      <Input
                        readOnly
                        className="flex-1 px-1 font-semibold border-none shadow-none"
                        value={name}
                        onChange={(e) => {
                          const updatedNames = [
                            ...form.getValues('productName'),
                          ]
                          updatedNames[index] = e.target.value
                          form.setValue('productName', updatedNames)
                        }}
                        placeholder={`Product Name ${index + 1}`}
                      />
                    </div>
                    <div className="flex flex-col w-full col-span-2 gap-1">
                      <Label>{t('order.quantity')}</Label>
                      <Input
                        readOnly
                        className="flex-1 px-1 font-semibold border-none shadow-none"
                        value={form.getValues('productQuantity')[index]}
                        placeholder="Quantity"
                        type="number"
                      />
                    </div>
                  </div>
                ))}
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
              {t('order.confirmCreateOrderTracking')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
