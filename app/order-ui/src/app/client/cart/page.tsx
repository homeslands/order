import { CircleAlert, ShoppingCartIcon, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QuantitySelector } from '@/components/app/button'
import { useCartItemStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import _ from 'lodash'
import { ClientTableSelect, OrderTypeSelect } from '@/components/app/select'
import { NavLink } from 'react-router-dom'
import { OrderTypeEnum } from '@/types'

export function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { getCartItems } = useCartItemStore()
  const cartItems = getCartItems()

  if (_.isEmpty(cartItems?.orderItems)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <ShoppingCartIcon className="h-32 w-32 text-primary" />
          <p className="text-center text-[13px]">Giỏ hàng trống</p>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button variant="default">Quay lại trang thực đơn</Button>
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className={`container py-10`}>
      {/* Order type selection */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left content */}
        <div className="w-full lg:w-2/3">
          {/* Note */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1">
              <CircleAlert size={14} className="text-destructive" />
              <span className="text-xs italic text-destructive">
                {t('order.selectTableNote')}
              </span>
            </div>
          </div>

          {/* Table select */}
          <ClientTableSelect />
        </div>

        {/* Right content */}
        <div className="w-full lg:w-1/3">
          <OrderTypeSelect />
          {/* Table list order items */}
          <div className="my-4">
            <div className="mb-4 grid grid-cols-7 rounded-md bg-muted/60 px-4 py-3 text-sm font-thin">
              <span className="col-span-2">{t('order.product')}</span>
              <span className="col-span-2 text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-2 text-center">
                {t('order.grandTotal')}
              </span>
              <span className="col-span-1 flex justify-center">
                <Trash2 size={18} />
              </span>
            </div>

            <div className="flex flex-col rounded-md border">
              {cartItems?.orderItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid w-full items-center gap-4 rounded-md p-4 pb-4"
                >
                  <div
                    key={`${item.slug}`}
                    className="grid w-full grid-cols-7 flex-row items-center"
                  >
                    <div className="col-span-2 flex w-full gap-2">
                      <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:justify-center">
                        <div className="flex flex-col">
                          <span className="sm:text-md truncate text-xs font-bold">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground sm:text-sm">
                            {`${(item.price || 0).toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <QuantitySelector cartItem={item} />
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold text-primary">
                        {`${((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <DeleteCartItemDialog cartItem={item} />
                    </div>
                  </div>
                  <CartNoteInput cartItem={item} />
                </div>
              ))}
            </div>
          </div>
          {/* Button */}
          <div className="flex w-full justify-end">
            <CreateOrderDialog
              disabled={
                cartItems?.type === OrderTypeEnum.AT_TABLE && !cartItems?.table
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
