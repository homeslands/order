import {
  CircleAlert,
  ShoppingBag,
  ShoppingCartIcon,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QuantitySelector } from '@/components/app/button'
import { ClientTableSelect } from '@/app/system/menu'
import { useCartItemStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { publicFileURL, ROUTE } from '@/constants'
import { IOrderType } from '@/types'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui'
import _ from 'lodash'

export function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { getCartItems, addOrderType } = useCartItemStore()
  const cartItems = getCartItems()

  const handleAddDeliveryMethod = (orderType: IOrderType) => {
    addOrderType(orderType)
  }

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
      {cartItems ? (
        <div className="rounded-sm bg-white p-5 shadow-lg">
          <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
            <div
              onClick={() => handleAddDeliveryMethod(IOrderType.AT_TABLE)}
              className={`flex cursor-pointer items-center justify-center py-2 text-sm transition-colors duration-200 ${
                getCartItems()?.type === IOrderType.AT_TABLE
                  ? 'border-primary bg-primary text-white'
                  : 'border'
              } rounded-full border-muted-foreground/40 text-muted-foreground hover:border-primary hover:bg-primary hover:text-white`}
            >
              {t('menu.dineIn')}
            </div>
            <div
              onClick={() => handleAddDeliveryMethod(IOrderType.TAKE_OUT)}
              className={`flex cursor-pointer items-center justify-center py-1 text-sm transition-colors duration-200 ${
                getCartItems()?.type === IOrderType.TAKE_OUT
                  ? 'border-primary bg-primary text-white'
                  : 'border'
              } rounded-full border-muted-foreground/40 text-muted-foreground hover:border-primary hover:bg-primary hover:text-white`}
            >
              {t('menu.takeAway')}
            </div>
          </div>
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
          <div className="flex justify-end py-4">
            <div className="w-full sm:max-w-[10rem]">
              <CreateOrderDialog disabled={!cartItems.table || !cartItems} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(51vh)] flex-col items-center justify-center gap-4 text-center">
          {/* Empty Cart Icon */}
          <ShoppingBag size={64} className="text-muted-foreground" />

          {/* Message */}
          <p className="text-lg text-muted-foreground">{t('order.noOrders')}</p>

          {/* Navigation Button */}
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button>{t('order.backToMenu')}</Button>
          </NavLink>
        </div>
      )}
    </div>
  )
}
