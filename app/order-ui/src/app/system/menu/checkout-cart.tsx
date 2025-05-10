import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Input, Label, ScrollArea } from '@/components/ui'
import { CartNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'

export default function CheckoutCart() {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')

  const { getCartItems, removeCartItem } = useCartItemStore()
  const navigate = useNavigate()

  // Lấy dữ liệu từ store
  const cartItems = getCartItems()

  // Tính tổng tiền
  const subtotal = cartItems?.orderItems.reduce((acc, orderItem) => {
    return acc + (orderItem.price || 0) * orderItem.quantity
  }, 0)

  const discount = 0
  const total = subtotal ? subtotal - discount : 0

  const handleRemoveCartItem = (orderItemId: string) => {
    removeCartItem(orderItemId)
  }

  return (
    <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
      {/* Header */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-primary">
          {t('order.orderInformation')}
        </h1>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col flex-1 gap-4 px-4 pb-8">
          <div className="flex flex-col gap-4 py-2 space-y-2">
            {/* Customer Information */}
            <div className="flex flex-col gap-4 pb-6 mt-6 border-b">
              <div className="flex flex-col gap-2">
                <Label>{t('order.customerName')}</Label>
                <Input placeholder={t('order.enterCustomerName')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('order.phoneNumber')}</Label>
                <Input placeholder={t('order.enterPhoneNumber')} />
              </div>
            </div>

            {/* Table Information */}
            <div className="flex flex-col gap-4 pb-6 mt-5 border-b">
              <div className="flex flex-col gap-2">
                <Label>{t('order.deliveryMethod')}</Label>
                <div className="flex flex-row gap-4 items-center">
                  <div className="flex justify-center items-center px-4 py-1 text-xs font-thin rounded-full w-fit bg-primary/15 text-primary">
                    {t('order.dineIn')}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t('order.tableNumber')}: {cartItems?.tableName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            {cartItems?.orderItems.map((item) => (
              <div
                key={item.slug}
                className="flex flex-col gap-4 pb-4 border-b"
              >
                <div
                  key={`${item.slug}`}
                  className="flex gap-2 items-center w-full rounded-xl"
                >
                  <img
                    src={`${publicFileURL}/${item.image}`}
                    alt={item.name}
                    className="object-cover w-20 h-20 rounded-2xl"
                  />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-row justify-between items-start">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold truncate">{item.name}</span>
                        <span className="text-xs font-thin text-muted-foreground">
                          {`${formatCurrency(item.price || 0)}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveCartItem(item.id)}
                      >
                        <Trash2 size={20} className="text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center w-full text-sm font-medium">
                      <span>
                        {t('order.quantity')} {item.quantity}
                      </span>
                      <span className="font-semibold text-muted-foreground">
                        {`${formatCurrency((item.price || 0) * item.quantity)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <CartNoteInput cartItem={item} />
              </div>
            ))}
          </div>
          {/* <PromotionInput /> */}
        </div>
      </ScrollArea>

      {/* Order Summary and Checkout */}
      <div className="p-4 mt-auto border-t bg-background">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('order.total')}</span>
            <span>{`${formatCurrency(subtotal || 0)}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('order.discount')}</span>
            <span className="text-xs text-green-600">
              - {`${formatCurrency(discount)}`}
            </span>
          </div>
          <div className="flex flex-col justify-start pt-2 border-t">
            <div className="flex justify-between">
              <span className="font-semibold">{t('order.grandTotal')}</span>
              <span className="text-lg font-bold text-primary">
                {`${formatCurrency(total)}`}
              </span>
            </div>
            {/* <div className="text-xs text-muted-foreground">
              {t('order.vat')}
            </div> */}
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center mt-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            {tCommon('common.back')}
          </Button>
          <CreateOrderDialog disabled={!cartItems?.orderItems.length} />
        </div>
      </div>
    </div>
  )
}
