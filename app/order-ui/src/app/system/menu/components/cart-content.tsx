import _ from 'lodash'
import { Info, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ScrollArea } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput, OrderNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { CreateCustomerDialog, CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { VoucherListSheet } from '@/components/app/sheet'
import { ShoppingCart } from 'lucide-react'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const cartItems = useCartItemStore((state) => state.cartItems)
  const removeCartItem = useCartItemStore((state) => state.removeCartItem)

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = subTotal * (cartItems?.voucher?.value || 0) / 100
  const totalAfterDiscount = subTotal - (subTotal * (cartItems?.voucher?.value || 0) / 100)

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  return (
    <div className="flex flex-col z-30 fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:w-[25%] xl:w-[25%] shadow-md overflow-hidden bg-background transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col gap-3 p-3 border-b backdrop-blur-sm shrink-0 bg-background/95">
        <div className='flex gap-2 justify-between items-center'>
          <h1 className="text-sm font-semibold">{t('menu.order')}</h1>
          {cartItems?.orderItems && (
            <CreateCustomerDialog />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="overflow-y-auto min-h-[calc(75vh-14rem)] flex-1 scrollbar-hidden">
        {/* Order type selection */}
        <div className="flex z-10 flex-col gap-2 px-4 py-3 border-b backdrop-blur-sm bg-background/95">
          <OrderTypeSelect />
          <CustomerSearchInput />
        </div>

        {/* Selected Table */}
        {cartItems?.type === OrderTypeEnum.AT_TABLE && (
          <div className="flex gap-2 items-center px-4 py-3 text-sm border-b bg-muted/50">
            {cartItems?.table ? (
              <div className='flex gap-2 items-center'>
                <p className="text-muted-foreground">{t('menu.selectedTable')}</p>
                <p className="px-3 py-1 font-medium text-white rounded-full bg-primary">
                  {t('menu.tableName')} {cartItems?.tableName}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {t('menu.noSelectedTable')}
              </p>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex flex-col gap-4 px-4 py-3">
          {cartItems && cartItems?.orderItems?.length > 0 ? (
            cartItems?.orderItems?.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-3 rounded-lg border transition-colors duration-200 hover:border-primary/50">
                <div className="flex flex-row gap-3 items-start">
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-row justify-between items-start">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">{item.name}</span>
                        <div className='flex justify-between items-center mt-1 w-full'>
                          {item.promotionValue && item.promotionValue > 0 ? (
                            <div className="flex gap-2 items-center">
                              <span className="text-sm text-muted-foreground">
                                Size {item.size.toUpperCase()} - {`${formatCurrency(item.price)}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {`${formatCurrency(item.price)}`}
                            </span>
                          )}
                          <div className='flex gap-2 items-center'>
                            <div className="flex justify-between items-center text-sm font-medium">
                              <QuantitySelector cartItem={item} />
                            </div>
                            <Button
                              title={item.id}
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCartItem(item.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CartNoteInput cartItem={item} />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[12rem] gap-3 text-muted-foreground">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-center">{tCommon('common.noData')}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer -Payment */}
      {cartItems && cartItems?.orderItems?.length !== 0 && (
        <div className="z-10 px-4 py-2 border-t backdrop-blur-sm shrink-0 bg-background/95">
          <div className='space-y-1'>
            <div className="flex flex-col gap-2">
              <OrderNoteInput order={cartItems} />
              <VoucherListSheet />
            </div>
            {cartItems?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex flex-col items-start">
                  <div className='flex gap-2 items-center'>
                    <span className='text-xs text-muted-foreground'>
                      {t('order.usedVoucher')}:
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border text-primary bg-primary/10 border-primary">
                      -{`${formatCurrency(discount)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('menu.total')}</span>
                <span className='text-muted-foreground'>{`${formatCurrency(subTotal || 0)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">
                    {t('menu.discount')}
                  </span>
                  <span className="text-sm text-green-600">
                    - {`${formatCurrency(discount)}`}
                  </span>
                </div>
              )}
              {/* {cartItems && (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table) && (
                <span className='flex gap-1 items-center text-sm text-destructive'>
                  <Info size={16} />
                  {t('menu.noSelectedTable')}
                </span>
              )} */}
              <div className="flex flex-col gap-1 justify-between items-start pt-3 font-medium border-t">
                <div className='flex gap-2 justify-between items-center w-full'>
                  <span className="text-sm font-semibold xl:text-lg">{t('menu.subTotal')}</span>
                  <span className="text-xl font-extrabold xl:text-2xl text-primary">
                    {`${formatCurrency(totalAfterDiscount)}`}
                  </span>
                </div>
                <div className='w-full'>
                  <CreateOrderDialog
                    disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
