import { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { Info, ShoppingCart, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui'
import { useCartItemStore } from '@/stores'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput } from '@/components/app/input'
import { publicFileURL } from '@/constants'
import { formatCurrency } from '@/utils'
import { cn } from '@/lib'
import { IUserInfo, OrderTypeEnum } from '@/types'
import { CreateCustomerDialog, CreateOrderDialog } from '../dialog'
import { OrderTypeSelect } from '../select'
import { VoucherListSheet } from '../sheet'
import TableSelect from '../select/table-select'

export default function CartDrawer({ className = '' }: { className?: string }) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  const [, setSelectedUser] = useState<IUserInfo | null>(null)
  const { getCartItems, removeCartItem } = useCartItemStore()
  const cartItems = getCartItems()

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = subTotal * (cartItems?.voucher?.value || 0) / 100
  const totalAfterDiscount = subTotal - (subTotal * (cartItems?.voucher?.value || 0) / 100)

  // check if cartItems is null, setSelectedUser to null
  useEffect(() => {
    if (!cartItems) {
      setSelectedUser(null)
    }
  }, [cartItems])

  return (
    <Drawer>
      <DrawerTrigger asChild className={cn(className)}>
        <div className="relative">
          {cartItems?.orderItems && cartItems.orderItems.length > 0 && (
            <span className="flex absolute -top-2 -right-2 justify-center items-center p-2 w-5 h-5 text-xs font-semibold bg-white rounded-full border border-gray-300 text-primary">
              {cartItems?.orderItems.length}
            </span>
          )}
          <Button variant="default" size="icon">
            <ShoppingCart className="h-[1.1rem] w-[1.1rem]" />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-[90%] ">
        <div className="pb-10 mx-4 overflow-y-scroll scrollbar-hidden [&::-webkit-scrollbar]:hidden">
          <DrawerHeader>
            <DrawerTitle>{t('menu.order')}</DrawerTitle>
            <DrawerDescription>{t('menu.orderDescription')}</DrawerDescription>
          </DrawerHeader>
          {cartItems && cartItems?.orderItems?.length > 0 ? (
            <div className='flex flex-col gap-3  min-h-[55%]'>
              {/* Order type selection */}
              <div className="flex flex-col gap-4 py-2">
                <div className='flex gap-2 items-center'>
                  <CustomerSearchInput />
                  <CreateCustomerDialog />
                </div>
                <OrderTypeSelect />
                <div className='flex flex-col gap-1'>
                  <span className='text-sm text-muted-foreground'>
                    {t('menu.table')}
                  </span>
                  <TableSelect />
                </div>
              </div>
              {/* Selected table */}
              {getCartItems()?.type === OrderTypeEnum.AT_TABLE && (
                <div className="flex items-center text-sm">
                  {getCartItems()?.table ? (
                    <div className='flex gap-1 items-center'>
                      <p>{t('menu.selectedTable')} </p>
                      <p className="px-3 py-1 text-white rounded bg-primary">
                        {t('menu.tableName')} {getCartItems()?.tableName}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t('menu.noSelectedTable')}
                    </p>
                  )}
                </div>
              )}
              <div className="overflow-y-scroll [&::-webkit-scrollbar]:hidden scrollbar-hiden flex flex-col gap-4 py-2 space-y-2">
                {cartItems ? (
                  cartItems?.orderItems?.map((item) => (
                    <div
                      key={item.slug}
                      className="flex flex-col gap-4 pb-4 border-b"
                    >
                      <div
                        key={`${item.slug}`}
                        className="flex flex-row gap-2 items-center rounded-xl"
                      >
                        {/* Product image */}
                        <img
                          src={`${publicFileURL}/${item.image}`}
                          alt={item.name}
                          className="object-cover w-20 h-20 rounded-2xl"
                        />
                        <div className="flex flex-col flex-1 gap-2">
                          <div className="flex flex-row justify-between items-start">
                            <div className="flex flex-col flex-1 gap-1 min-w-0">
                              <span className="font-bold truncate">
                                {item.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Size {item.size && item.size.toUpperCase()} - {`${formatCurrency(item.price)}`}
                              </span>
                              {/* <span className="text-xs font-thin text-muted-foreground">
                              {`${formatCurrency(item.price || 0)}`}
                            </span> */}
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <Trash2 size={20} className="text-muted-foreground" />
                            </Button>
                          </div>

                          <div className="flex justify-between items-center w-full text-sm font-medium">
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
              <VoucherListSheet />
            </div>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}

          <DrawerFooter>
            {cartItems && cartItems?.orderItems?.length > 0 && (
              <div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('menu.total')}</span>
                    <span>{`${formatCurrency(subTotal || 0)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('menu.discount')}
                    </span>
                    <span className="text-xs text-green-600">
                      - {`${formatCurrency(discount)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 font-medium border-t">
                    <span className="font-semibold">{t('menu.subTotal')}</span>
                    <span className="text-lg font-bold text-primary">
                      {`${formatCurrency(totalAfterDiscount)}`}
                    </span>
                  </div>
                </div>


                {/* Order button */}
                <div className='flex gap-4 justify-end mt-2 w-full h-24'>

                  <div className='flex gap-2 justify-end items-center w-full h-fit'>
                    {cartItems && (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table) && (
                      <span className='flex gap-1 items-center text-xs text-destructive'>
                        <Info size={18} />
                        {t('menu.noSelectedTable')}
                      </span>
                    )}
                    <DrawerClose ref={drawerCloseRef} asChild>
                      <Button
                        variant="outline"
                        className="rounded-full border border-gray-400 w-fit"
                      >
                        {tCommon('common.close')}
                      </Button>
                    </DrawerClose>
                    <div className='flex justify-end w-fit'>
                      <CreateOrderDialog
                        onSuccess={() => {
                          drawerCloseRef.current?.click();
                        }}
                        disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
