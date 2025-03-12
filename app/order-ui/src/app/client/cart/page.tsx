import _ from 'lodash'
import { CircleAlert, ShoppingCartIcon, Trash2 } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { QuantitySelector } from '@/components/app/button'
import { useCartItemStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { OrderTypeSelect, TableInCartSelect } from '@/components/app/select'
import { VoucherListSheet } from '@/components/app/sheet'
import { formatCurrency } from '@/utils'
import { OrderTypeEnum } from '@/types'

export default function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { t: tHelmet } = useTranslation('helmet')
  const { getCartItems } = useCartItemStore()
  const cartItems = getCartItems()

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = subTotal * (cartItems?.voucher?.value || 0) / 100
  const totalAfterDiscount = subTotal - (subTotal * (cartItems?.voucher?.value || 0) / 100)

  if (_.isEmpty(cartItems?.orderItems)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <ShoppingCartIcon className="w-32 h-32 text-primary" />
          <p className="text-center text-[13px]">
            {t('order.noOrders')}
          </p>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button variant="default">
              {t('order.backToMenu')}
            </Button>
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className={`container py-10`}>
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.cart.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.cart.title')} />
      </Helmet>
      {/* Order type selection */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left content */}
        {/* <div className="w-full lg:w-1/2">
          Note
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1">
              <CircleAlert size={14} className="text-destructive" />
              <span className="text-xs italic text-destructive">
                {t('order.selectTableNote')}
              </span>
            </div>
          </div>

          Table select

          <ClientTableSelect />
        </div> */}

        {/* Right content */}
        <div className="w-full">
          <div className="flex items-center gap-1 pb-4">
            <CircleAlert size={14} className="text-destructive" />
            <span className="text-xs italic text-destructive">
              {t('order.selectTableNote')}
            </span>
          </div>
          <div className='flex gap-1'>
            <OrderTypeSelect />
            <TableInCartSelect />
          </div>
          {/* Table list order items */}
          <div className="my-4">
            <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin rounded-md bg-muted-foreground/15">
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
            <div className="flex flex-col items-end justify-between p-2 pt-4 mt-4 border rounded-md">
              <div className="flex flex-col items-start justify-between w-full">
                <div className='flex flex-col items-start justify-start w-full gap-1'>
                  <div className='flex items-center justify-between w-full gap-2 text-sm text-muted-foreground'>
                    {t('order.subtotal')}:&nbsp;
                    <span>
                      {`${formatCurrency(subTotal)}`}
                    </span>
                  </div>
                  <div className='flex items-center justify-between w-full gap-2 text-sm text-muted-foreground'>
                    <span>
                      {t('order.discount')}:&nbsp;
                    </span>
                    <span className='text-green-500'>
                      -{`${formatCurrency(discount)}`}
                    </span>
                  </div>
                  <div className='flex items-center justify-between w-full gap-2 pt-2 mt-4 font-semibold border-t text-md'>
                    <span>
                      {t('order.totalPayment')}:&nbsp;
                    </span>
                    <span className='text-2xl font-extrabold text-primary'>
                      {`${formatCurrency(totalAfterDiscount)}`}
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    ({t('order.vat')})
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Button */}
          <div className='flex justify-end w-full'>
            <div className="flex justify-end w-1/6">
              <CreateOrderDialog
                disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
