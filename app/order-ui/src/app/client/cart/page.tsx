import { useEffect } from 'react'
import _ from 'lodash'
// import Joyride from 'react-joyride';
import { CircleAlert, ShoppingCartIcon, Trash2 } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { QuantitySelector } from '@/components/app/button'
import { useCartItemStore, useUserStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteAllCartDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { ROUTE, VOUCHER_TYPE } from '@/constants'
import { Button } from '@/components/ui'
import { OrderTypeSelect, TableInCartSelect } from '@/components/app/select'
import { VoucherListSheet } from '@/components/app/sheet'
import { formatCurrency } from '@/utils'
import { OrderTypeEnum } from '@/types'
import { publicFileURL } from '@/constants'
import { OrderNoteInput } from '@/components/app/input'

export default function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { t: tHelmet } = useTranslation('helmet')
  // const [runJoyride, setRunJoyride] = useState(false)
  const { userInfo } = useUserStore()
  const { addCustomerInfo } = useCartItemStore()

  // addCustomerInfo when mount
  useEffect(() => {
    if (userInfo) {
      addCustomerInfo(userInfo)
    }
  }, [userInfo, addCustomerInfo])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const timer = setTimeout(() => {
      // setRunJoyride(true)
    }, 300) // delay nhẹ để scroll xong rồi mới chạy joyride

    return () => clearTimeout(timer)
  }, [])
  // const steps = [
  //   {
  //     target: '.joyride-step-1',
  //     content: 'Hãy chọn hình thức đặt hàng trước nhé!',
  //     disableBeacon: true,
  //   },
  //   {
  //     target: '.joyride-step-2',
  //     content: 'Đừng quên chọn bàn nếu bạn đang dùng tại quán!',
  //   },
  //   {
  //     target: '.joyride-step-3',
  //     content: 'Sau khi kiểm tra giỏ hàng, hãy nhấn vào đây để đặt!',
  //   },
  // ];

  const { getCartItems } = useCartItemStore()
  const cartItems = getCartItems()

  const subTotal = _.sumBy(
    cartItems?.orderItems,
    (item) => item.price * item.quantity,
  )
  // check if voucher is percent order
  const isPercentOrder = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
  const discount = isPercentOrder
    ? (subTotal * (cartItems?.voucher?.value || 0)) / 100
    : cartItems?.voucher?.value
  const totalAfterDiscount =
    subTotal - (subTotal * (cartItems?.voucher?.value || 0)) / 100

  if (_.isEmpty(cartItems?.orderItems)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col gap-5 justify-center items-center">
          <ShoppingCartIcon className="w-32 h-32 text-primary" />
          <p className="text-center text-[13px]">{t('order.noOrders')}</p>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button variant="default">{t('order.backToMenu')}</Button>
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className={`container py-10`}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.cart.title')}</title>
        <meta name="description" content={tHelmet('helmet.cart.title')} />
      </Helmet>
      {/* Order type selection */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full">
          <div className="flex gap-1 items-center pb-4">
            <CircleAlert size={14} className="text-destructive" />
            <span className="text-xs italic text-destructive">
              {t('order.selectTableNote')}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="joyride-step-1">
              <OrderTypeSelect />
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
              <div className="joyride-step-2 sm:col-span-4">
                <TableInCartSelect />
              </div>
              <DeleteAllCartDialog />
              {/* <Joyride
                run={runJoyride}
                steps={steps}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                disableScrolling={true}
                styles={{
                  options: {
                    zIndex: 10000,
                    primaryColor: '#f79e22',  // Nút chính (ví dụ: xanh lá)
                    textColor: '#000000',
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                  },
                  tooltip: {
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                  buttonNext: {
                    backgroundColor: '#f79e22',
                  },
                  buttonBack: {
                    color: '#64748b',
                  },
                }}
              /> */}
            </div>
          </div>

          {/* Table list order items */}
          <div className="my-4">
            <div className="grid grid-cols-8 px-4 py-3 mb-4 text-sm font-thin rounded-md bg-muted-foreground/15">
              <span className="col-span-3">{t('order.product')}</span>
              <span className="col-span-2 text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-2 text-center">
                {t('order.grandTotal')}
              </span>
              <span className="flex col-span-1 justify-center">
                <Trash2 size={18} />
              </span>
            </div>
            <div className="flex flex-col mb-2 rounded-md border">
              {cartItems?.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-7 gap-4 items-center p-4 pb-4 w-full rounded-md sm:grid-cols-8"
                >
                  <img
                    src={publicFileURL + '/' + item?.image}
                    alt={item.name}
                    className="hidden col-span-1 w-36 h-24 rounded-md sm:block"
                  />
                  <div className="grid flex-row col-span-7 gap-4 items-center w-full">
                    <div
                      key={`${item.id}`}
                      className="grid flex-row grid-cols-7 gap-4 items-center w-full"
                    >
                      <div className="flex col-span-2 gap-2 w-full">
                        <div className="flex flex-col gap-2 justify-start items-center w-full sm:flex-row sm:justify-center">
                          <div className="flex flex-col w-full">
                            <span className="overflow-hidden w-full text-xs font-bold truncate whitespace-nowrap sm:text-md text-ellipsis">
                              {item.name}
                            </span>
                            <span className="text-xs text-muted-foreground sm:text-sm">
                              {`${(item.price || 0).toLocaleString('vi-VN')}đ`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex col-span-2 justify-center">
                        <QuantitySelector cartItem={item} />
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-semibold text-primary">
                          {`${((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ`}
                        </span>
                      </div>
                      <div className="flex col-span-1 justify-center">
                        <DeleteCartItemDialog cartItem={item} />
                      </div>
                    </div>
                    <CartNoteInput cartItem={item} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <OrderNoteInput order={cartItems} />
              <VoucherListSheet />
            </div>
            <div>
              {getCartItems()?.voucher && (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {t('order.usedVoucher')}:&nbsp;
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full border border-primary bg-primary/20 text-primary">
                        -{`${formatCurrency(discount || 0)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between items-end p-2 pt-4 mt-4 rounded-md border">
              <div className="flex flex-col justify-between items-start w-full">
                <div className="flex flex-col gap-1 justify-start items-start w-full">
                  <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
                    {t('order.subtotal')}:&nbsp;
                    <span>{`${formatCurrency(subTotal)}`}</span>
                  </div>
                  <div className="flex gap-2 justify-between items-center w-full text-sm text-muted-foreground">
                    <span className="italic text-green-500">
                      {t('order.discount')}:&nbsp;
                    </span>
                    <span className="italic text-green-500">
                      -{`${formatCurrency(discount || 0)}`}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-between items-center pt-2 mt-4 w-full font-semibold border-t text-md">
                    <span>{t('order.totalPayment')}:&nbsp;</span>
                    <span className="text-2xl font-extrabold text-primary">
                      {`${formatCurrency(totalAfterDiscount)}`}
                    </span>
                  </div>
                  {/* <span className='text-xs text-muted-foreground'>
                    ({t('order.vat')})
                  </span> */}
                </div>
              </div>
            </div>
          </div>
          {/* Button */}
          <div className="flex gap-2 justify-end w-full">
            {/* {cartItems &&
              cartItems.type === OrderTypeEnum.AT_TABLE &&
              !cartItems.table && (
                <span className="flex gap-2 justify-end items-center text-xs text-destructive">
                  <Info size={18} />
                  {t('menu.noSelectedTable')}
                </span>
              )} */}
            <div className="flex justify-end w-fit">
              <CreateOrderDialog
                disabled={
                  !cartItems ||
                  (cartItems.type === OrderTypeEnum.AT_TABLE &&
                    !cartItems.table)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
