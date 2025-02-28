import React from 'react'
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

interface IFormDeliverByStaffProps {
  onSubmit: (isOpen: boolean) => void
}

export const CreateOrderTrackingByStaffForm: React.FC<
  IFormDeliverByStaffProps
> = ({ onSubmit }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { mutate: createOrderTracking } = useCreateOrderTracking()
  const { getSelectedItems, clearSelectedItems } = useOrderTrackingStore()
  const { getOrder, addOrder } = useOrderStore()
  // const { refetch } = useOrderBySlug(getOrder()?.slug as string)

  const form = useForm<TCreateOrderTrackingByStaffSchema>({
    resolver: zodResolver(createOrderTrackingByStaffSchema),

    defaultValues: {
      type: 'by-staff',
      trackingOrderItems: getSelectedItems().map((item) => ({
        quantity: item.quantity,
        orderItem: item.slug,
      })),
      productName: getSelectedItems().map((item) => item.variant.product.name),
      productQuantity: getSelectedItems().map((item) => item.quantity),
    },
  })

  const handleSubmit = (data: ICreateOrderTrackingRequest) => {
    createOrderTracking(data, {
      onSuccess: async () => {
        try {
          // Invalidate and refetch the specific order query
          await queryClient.invalidateQueries({
            queryKey: ['order', getOrder()?.slug],
          })

          // Retrieve the updated data from the query cache
          const updatedOrderData = queryClient.getQueryData<{ result: IOrder }>(
            ['order', getOrder()?.slug],
          )

          // Update the order store with the latest data
          if (updatedOrderData?.result) {
            addOrder(updatedOrderData.result)
          }

          // Reset the form and close the modal
          form.reset()
          onSubmit(false)
          clearSelectedItems()

          // Show success toast
          showToast(t('toast.createOrderTrackingSuccess'))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          showToast(t('toast.errorUpdatingOrder'))
        }
      },
    })
  }

  const formFields = {
    products: (
      <FormField
        control={form.control}
        name="productName" // Base on `productName` as both `productName` and `productQuantity` will be rendered in rows
        render={() => (
          <FormItem>
            {/* <FormLabel>{t('order.productName')}</FormLabel> */}
            <FormControl>
              <div className="space-y-2">
                {form.getValues('productName').map((name, index) => (
                  <div
                    key={`product-row-${index}`}
                    className="grid grid-cols-5 gap-4 text-sm text-muted-foreground"
                  >
                    <div className="col-span-3 flex flex-col gap-1">
                      <Label>{t('order.productName')}</Label>
                      <Input
                        className="flex-1"
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
                    <div className="col-span-2 flex w-full flex-col gap-1">
                      <Label>{t('order.quantity')}</Label>
                      <Input
                        readOnly
                        value={form.getValues('productQuantity')[index]}
                        // onChange={(e) => {
                        //   const updatedQuantities = [
                        //     ...form.getValues('productQuantity'),
                        //   ]
                        //   updatedQuantities[index] =
                        //     parseInt(e.target.value, 10) || 0
                        //   form.setValue('productQuantity', updatedQuantities)
                        // }}
                        placeholder="Quantity"
                        type="number"
                        min={0}
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
