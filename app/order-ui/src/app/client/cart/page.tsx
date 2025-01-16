import { CircleAlert, ShoppingCartIcon, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QuantitySelector } from '@/components/app/button'
import { useCartItemStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import _ from 'lodash'
import { ClientTableSelect } from '@/components/app/select'
import { NavLink } from 'react-router-dom'
import { OrderTypeSelect } from './components/order-type-select'

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
                        <img
                          src={`${publicFileURL}/${item.image}`}
                          alt={item.name}
                          className="h-12 w-20 rounded-lg object-cover sm:h-16 sm:w-24"
                        />
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
          <CreateOrderDialog disabled={!cartItems} />
        </div>
      </div>
    </div>
  )
}
