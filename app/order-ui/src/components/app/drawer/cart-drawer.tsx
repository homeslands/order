import { ShoppingCart, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useCartItemStore } from '@/stores'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput } from '@/components/app/input'
import { publicFileURL } from '@/constants'
import { formatCurrency } from '@/utils'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib'
import { IUserInfo, OrderTypeEnum } from '@/types'
import { CreateOrderDialog } from '../dialog'
import { OrderTypeSelect } from '../select'

export default function CartDrawer({ className = '' }: { className?: string }) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])

  const [, setSelectedUser] = useState<IUserInfo | null>(null)
  const { getCartItems, removeCartItem } = useCartItemStore()
  const cartItems = getCartItems()

  const subtotal = useMemo(() => {
    return cartItems?.orderItems?.reduce((acc, orderItem) => {
      return acc + (orderItem.price || 0) * orderItem.quantity
    }, 0) || 0
  }, [cartItems])

  const discount = useMemo(() => {
    return cartItems?.orderItems.reduce(
      (sum, item) => sum + (item.promotionValue ? item.price * item.quantity * item.promotionValue / 100 : 0),
      0
    ) || 0;
  }, [cartItems]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

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
            <span className="absolute flex items-center justify-center w-5 h-5 p-2 text-xs font-semibold bg-white border border-gray-300 rounded-full -right-2 -top-2 text-primary">
              {cartItems?.orderItems.length}
            </span>
          )}
          <Button variant="default" size="icon">
            <ShoppingCart className="h-[1.1rem] w-[1.1rem]" />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-[90%]">
        <div className="pb-10 mx-4">
          <DrawerHeader>
            <DrawerTitle>{t('menu.order')}</DrawerTitle>
            <DrawerDescription>{t('menu.orderDescription')}</DrawerDescription>
          </DrawerHeader>
          {cartItems && cartItems?.orderItems?.length > 0 ? (
            <div className='flex flex-col gap-3 max-h-[55%] min-h-[55%]'>
              {/* Order type selection */}
              <div className="flex flex-col gap-2 py-2">
                <CustomerSearchInput />
                <OrderTypeSelect />
              </div>
              {/* Selected table */}
              {getCartItems()?.type === OrderTypeEnum.AT_TABLE && (
                <div className="flex items-center text-sm">
                  {getCartItems()?.table ? (
                    <div className='flex items-center gap-1'>
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
                    <span>{`${formatCurrency(subtotal || 0)}`}</span>
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
                      {`${formatCurrency(total)}`}
                    </span>
                  </div>
                </div>
                <div className="grid flex-row grid-cols-2 gap-2 mt-4">
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      className="w-full border border-gray-400 rounded-full"
                    >
                      {tCommon('common.close')}
                    </Button>
                  </DrawerClose>
                  {/* Order button */}
                  <div className='flex justify-end w-full'>
                    <CreateOrderDialog
                      disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
                    />
                  </div>
                </div>
              </div>)}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
