import { useEffect, useMemo } from 'react'
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
import { ROUTE, VOUCHER_TYPE, publicFileURL } from '@/constants'
import { Button } from '@/components/ui'
import { OrderTypeSelect, TableInCartSelect } from '@/components/app/select'
import { VoucherListSheet } from '@/components/app/sheet'
import { formatCurrency, applyVoucherToCart, calculateCartTotals, showErrorToast } from '@/utils'
import { OrderTypeEnum } from '@/types'
import { OrderNoteInput } from '@/components/app/input'

export default function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { t: tVoucher } = useTranslation('voucher')
  const { t: tHelmet } = useTranslation('helmet')
  // const [runJoyride, setRunJoyride] = useState(false)
  const { userInfo } = useUserStore()
  const { addCustomerInfo, getCartItems, removeVoucher } = useCartItemStore()

  // Không dùng state nữa, tính toán trực tiếp trong render để tránh stale state
  const currentCartItems = getCartItems()
  // console.log('🔍 [ClientCartPage] currentCartItems:', currentCartItems)

  // Sử dụng useMemo để force re-calculation khi orderItems hoặc voucher thay đổi
  const { cartWithVoucher, itemLevelDiscount, calculations } = useMemo(() => {
    const { cart: cartWithVoucher, itemLevelDiscount } = applyVoucherToCart(currentCartItems)
    const calculations = calculateCartTotals(cartWithVoucher, itemLevelDiscount)

    return { cartWithVoucher, itemLevelDiscount, calculations }
  }, [
    currentCartItems,
  ])

  // addCustomerInfo when mount
  useEffect(() => {
    if (userInfo) {
      addCustomerInfo(userInfo)
    }
  }, [userInfo, addCustomerInfo])

  // Kiểm tra voucher validity cho SAME_PRICE_PRODUCT
  useEffect(() => {
    if (currentCartItems?.voucher && currentCartItems.voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      const voucherProductSlugs = currentCartItems.voucher.voucherProducts?.map(vp => vp.product.slug) || []
      const hasValidProducts = currentCartItems.orderItems.some(item => voucherProductSlugs.includes(item.slug))

      if (!hasValidProducts) {
        showErrorToast(143422)
        removeVoucher()
      }
    }
  }, [currentCartItems, removeVoucher])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const timer = setTimeout(() => {
      // setRunJoyride(true)
    }, 300) // delay nhẹ để scroll xong rồi mới chạy joyride

    return () => clearTimeout(timer)
  }, [])

  // Destructure để dễ sử dụng từ tính toán trực tiếp
  const { subTotalBeforeDiscount, promotionDiscount, subTotal } = calculations
  // console.log('🔍 [ClientCartPage] calculations:', calculations)

  // Tổng tất cả giảm giá voucher (bao gồm item-level và order-level)
  const totalVoucherDiscount = itemLevelDiscount

  if (_.isEmpty(cartWithVoucher?.orderItems)) {
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
              {cartWithVoucher?.orderItems.map((item) => (
                <div
                  key={`${item.id}-${cartWithVoucher?.voucher?.slug || 'no-voucher'}`}
                  className="grid grid-cols-7 gap-4 items-center p-4 pb-4 w-full rounded-md sm:grid-cols-8"
                >
                  <img
                    src={publicFileURL + '/' + item?.image}
                    alt={item.name}
                    className="hidden col-span-1 w-36 h-24 rounded-md sm:block"
                  />
                  <div className="grid flex-row col-span-7 gap-4 items-center w-full">
                    <div
                      className="grid flex-row grid-cols-7 gap-4 items-center w-full"
                    >
                      <div className="flex col-span-2 gap-2 w-full">
                        <div className="flex flex-col gap-2 justify-start items-center w-full sm:flex-row sm:justify-center">
                          <div className="flex flex-col w-full">
                            <span className="overflow-hidden w-full text-xs font-bold truncate whitespace-nowrap sm:text-sm text-ellipsis">
                              {item.name}
                            </span>
                            <span className="inline-block relative text-xs sm:text-sm text-muted-foreground">
                              {(() => {
                                // Kiểm tra đơn giản hơn dựa trên dữ liệu thực tế
                                const hasVoucherDiscount = item.voucherDiscount && item.voucherDiscount > 0
                                const hasPromotionDiscount = item.promotionDiscount && item.promotionDiscount > 0

                                const original = item.originalPrice || item.price
                                const price = item.price

                                // Có giảm giá nếu originalPrice khác price hoặc có discount
                                const hasDiscount = hasVoucherDiscount || hasPromotionDiscount || (original > price)

                                return (
                                  <div className="flex gap-1 items-center">
                                    {hasDiscount && (
                                      <span className="absolute -top-1 left-32 text-[16px] text-primary font-bold">
                                        {hasVoucherDiscount ? '**' : '*'}
                                      </span>
                                    )}

                                    {hasDiscount ? (
                                      <>
                                        <span className="mr-1 line-through text-muted-foreground/70">
                                          {formatCurrency(original)}
                                        </span>
                                        <span className="font-bold text-primary">
                                          {formatCurrency(price)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-bold text-primary">
                                        {formatCurrency(price)}
                                      </span>
                                    )}
                                  </div>
                                )
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex col-span-2 justify-center">
                        <QuantitySelector cartItem={item} />
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-semibold text-primary">
                          {`${formatCurrency((item.price || 0) * item.quantity)}`}
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
              <OrderNoteInput order={cartWithVoucher} />
              {/* Chú thích bên dưới order note */}
              <div className="p-3 rounded-md border bg-primary/10 border-primary">
                <div className="flex gap-2 items-start text-sm text-primary">
                  <div className="flex-1">
                    <p className="text-xs text-primary">
                      <span className="font-extrabold">{t('order.voucher')}</span>
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-primary">
                      <li className="flex gap-1 items-center">
                        <span className="font-bold text-primary">*</span>
                        <span>{t('order.promotionDiscount')}</span>
                      </li>
                      <li className="flex gap-1 items-center">
                        <span className="font-bold text-primary">**</span>
                        <span>{t('order.itemLevelVoucher')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('order.voucher')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('order.voucher')}
                </span>
              </div>
              <VoucherListSheet />
            </div>
            <div>
              {cartWithVoucher?.voucher && (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {t('order.usedVoucher')}:
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full border border-primary bg-primary/20 text-primary">
                        -{`${formatCurrency(itemLevelDiscount || 0)}`}
                      </span>
                    </div>

                    {/* Hiển thị nội dung chi tiết theo loại voucher */}
                    <div className="mt-1 text-xs italic text-muted-foreground">
                      {(() => {
                        const voucher = cartWithVoucher?.voucher
                        if (!voucher) return null

                        switch (voucher.type) {
                          case VOUCHER_TYPE.PERCENT_ORDER:
                            return `${tVoucher('voucher.discountValue')}${voucher.value}% ${tVoucher('voucher.orderValue')}`

                          case VOUCHER_TYPE.FIXED_VALUE:
                            return `${tVoucher('voucher.discountValue')}${formatCurrency(voucher.value)} ${tVoucher('voucher.orderValue')}`

                          case VOUCHER_TYPE.SAME_PRICE_PRODUCT:
                            return `${tVoucher('voucher.samePrice')} ${formatCurrency(voucher.value)} ${tVoucher('voucher.forSelectedProducts')}`

                          default:
                            return ''
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

            </div>
            <div className="flex flex-col justify-between items-end p-2 pt-4 mt-4 rounded-md border">
              <div className="flex flex-col justify-between items-start w-full">
                <div className="flex flex-col gap-2 w-full text-sm text-muted-foreground">

                  {/* Tổng giá gốc */}
                  <div className="flex justify-between">
                    <span>{t('order.subtotalBeforeDiscount')}</span>
                    <span>{formatCurrency(subTotalBeforeDiscount)}</span>
                  </div>

                  {/* Giảm giá khuyến mãi (promotion) */}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between italic text-yellow-600">
                      <span>{t('order.promotionDiscount')}</span>
                      <span>-{formatCurrency(promotionDiscount)}</span>
                    </div>
                  )}

                  {/* Tổng giảm giá voucher */}
                  {totalVoucherDiscount > 0 && (
                    <div className="flex justify-between italic text-green-600">
                      <span>{t('order.voucherDiscount')}</span>
                      <span>-{formatCurrency(totalVoucherDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 mt-2 font-semibold border-t text-md">
                    <span>{t('order.totalPayment')}</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(subTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Button */}
          <div className="flex gap-2 justify-end w-full">
            <div className="flex justify-end w-fit">
              <CreateOrderDialog
                disabled={
                  !cartWithVoucher ||
                  (cartWithVoucher?.type === OrderTypeEnum.AT_TABLE &&
                    !cartWithVoucher?.table)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
