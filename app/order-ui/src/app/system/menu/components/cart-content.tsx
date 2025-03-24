import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ScrollArea } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { VoucherListSheet } from '@/components/app/sheet'
import _ from 'lodash'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { getCartItems, removeCartItem } = useCartItemStore()

  const cartItems = getCartItems()

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = subTotal * (cartItems?.voucher?.value || 0) / 100
  const totalAfterDiscount = subTotal - (subTotal * (cartItems?.voucher?.value || 0) / 100)

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        <h1 className="text-lg font-medium">{t('menu.order')}</h1>
      </div>
      {/* Order type selection */}
      <div className="flex flex-col gap-2 px-4 py-2">
        {/* Customer Information */}
        <CustomerSearchInput />
        <OrderTypeSelect />
      </div>

      {/* Selected table */}
      {getCartItems()?.type === OrderTypeEnum.AT_TABLE ? (
        <div className="flex items-center gap-1 px-4 text-sm">
          {getCartItems()?.table ? (
            <div className='flex items-center gap-1'>
              <p>{t('menu.selectedTable')} </p>
              <p className="px-3 py-1 text-white rounded bg-primary">
                {t('menu.tableName')} {getCartItems()?.tableName}
              </p>
            </div>
          ) : (
            <p className="h-7 text-muted-foreground">
              {t('menu.noSelectedTable')}
            </p>
          )}
        </div>
      ) : (
        <div className='h-0' />
        // <div className='h-9' />
      )}

      {/* Cart Items - Scrollable area */}
      <ScrollArea className="mt-4 max-h-[calc(50vh-11rem)] flex-1 px-4">
        <div className="flex flex-col gap-4">
          {cartItems ? (
            cartItems?.orderItems?.map((item) => (
              <div
                key={item.slug}
                className="flex flex-col gap-4 pb-4 border-b"
              >
                <div
                  key={`${item.slug}`}
                  className="flex flex-row items-center gap-2 rounded-xl"
                >
                  {/* Product image */}
                  <img
                    src={`${publicFileURL}/${item.image}`}
                    alt={item.name}
                    className="object-cover w-20 h-20 rounded-2xl"
                  />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-row items-start justify-between">
                      <div className="flex flex-col flex-1 min-w-0 gap-1">
                        <span className="text-sm font-bold truncate">{item.name}</span>
                        {item.promotionValue && item.promotionValue > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Size {item.size.toUpperCase()} - {`${formatCurrency(item.price)}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-primary">
                            {`${formatCurrency(item.price)}`}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveCartItem(item.id)}
                      >
                        <Trash2 size={20} className="text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between w-full text-sm font-medium">
                      <QuantitySelector cartItem={item} />
                    </div>
                  </div>
                </div>
                <CartNoteInput cartItem={item} />
              </div>
            ))
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Summary - Fixed at bottom */}
      {cartItems && cartItems?.orderItems?.length !== 0 && (
        <div className="px-4 border-t">
          <div className='py-1'>
            <VoucherListSheet />
            <div>
              {getCartItems()?.voucher && (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='text-xs text-muted-foreground'>
                        {t('order.usedVoucher')}:&nbsp;
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/20 border-primary">
                        -{`${formatCurrency(discount)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('menu.total')}</span>
              <span className='text-muted-foreground'>{`${formatCurrency(subTotal || 0)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs italic text-green-500">
                {t('menu.discount')}
              </span>
              <span className="text-xs italic text-green-500">
                - {`${formatCurrency(discount)}`}
              </span>
            </div>
            <div className="flex justify-between py-4 font-medium border-t">
              <span className="font-semibold">{t('menu.subTotal')}</span>
              <span className="text-2xl font-bold text-primary">
                {`${formatCurrency(totalAfterDiscount)}`}
              </span>
            </div>
          </div>
          {/* Order button */}
          <div className='flex justify-end w-full'>
            <div className='flex justify-end w-1/2'>
              <CreateOrderDialog
                disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
