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
import { ClientTableSelect } from '@/components/app/select'
import { NavLink } from 'react-router-dom'
import { OrderTypeSelect } from './components/order-type-select'
import { OrderTypeEnum } from '@/types'

export function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { getCartItems } = useCartItemStore()
  const cartItems = getCartItems()

  if (_.isEmpty(cartItems?.orderItems)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <ShoppingCartIcon className="w-32 h-32 text-primary" />
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
      <div className="grid grid-cols-12 gap-4">
        {/* Left content */}
        <div className="col-span-12 lg:col-span-8">
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
        <div className="col-span-12 lg:col-span-4">
          <OrderTypeSelect />
          {/* Table list order items */}
          <div className="my-4">
            <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin rounded-md bg-muted/60">
              <span className="col-span-2">{t('order.product')}</span>
              <span className="col-span-2 text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-2 text-center">
                {t('order.grandTotal')}
              </span>
              <span className="flex justify-center col-span-1">
                <Trash2 size={18} />
              </span>
            </div>

            <div className="flex flex-col border rounded-md">
              {cartItems?.orderItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid items-center w-full gap-4 p-4 pb-4 rounded-md"
                >
                  <div
                    key={`${item.slug}`}
                    className="grid flex-row items-center w-full grid-cols-7"
                  >
                    <div className="flex w-full col-span-2 gap-2">
                      <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:justify-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold truncate sm:text-md">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground sm:text-sm">
                            {`${(item.price || 0).toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center col-span-2">
                      <QuantitySelector cartItem={item} />
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold text-primary">
                        {`${((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                    <div className="flex justify-center col-span-1">
                      <DeleteCartItemDialog cartItem={item} />
                    </div>
                  </div>
                  <CartNoteInput cartItem={item} />
                </div>
              ))}
            </div>
          </div>
          {/* Button */}
          <CreateOrderDialog disabled={cartItems?.type === OrderTypeEnum.AT_TABLE && !cartItems?.table} />

        </div>
      </div>
    </div>
  )
}
