import { useEffect } from 'react'
import _ from 'lodash'
// import Joyride from 'react-joyride';
import { CircleAlert, ShoppingCartIcon, Trash2 } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { QuantitySelector } from '@/components/app/button'
import { useOrderFlowStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import {
  CreateOrderDialog,
  DeleteAllCartDialog,
  DeleteCartItemDialog,
} from '@/components/app/dialog'
import { ROUTE, VOUCHER_TYPE, publicFileURL } from '@/constants'
import { Button } from '@/components/ui'
import { OrderTypeSelect, ProductVariantSelect, TableInCartSelect } from '@/components/app/select'
import { VoucherListSheet } from '@/components/app/sheet'
import { formatCurrency, calculateCartTotals, showErrorToast, calculateCartItemDisplay } from '@/utils'
import { OrderNoteInput } from '@/components/app/input'
import ProductImage from '@/assets/images/ProductImage.png'
import { OrderTypeEnum } from '@/types'
import { useIsMobile } from '@/hooks'

export default function ClientCartPage() {
  const { t } = useTranslation('menu')
  const { t: tVoucher } = useTranslation('voucher')
  const { t: tHelmet } = useTranslation('helmet')
  // const [runJoyride, setRunJoyride] = useState(false)
  const isMobile = useIsMobile()
  const { removeVoucher, getCartItems, addOrderingProductVariant } = useOrderFlowStore()

  const currentCartItems = getCartItems()

  const displayItems = calculateCartItemDisplay(
    currentCartItems,
    currentCartItems?.voucher || null
  )

  const cartTotals = calculateCartTotals(displayItems, currentCartItems?.voucher || null)

  const handleChangeVariant = (id: string) => {
    addOrderingProductVariant(id)
  }

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

  // use useEffect to check if subtotal is less than minOrderValue of voucher
  useEffect(() => {
    if (currentCartItems && currentCartItems.voucher) {
      const { voucher, orderItems } = currentCartItems

      // Nếu không phải SAME_PRICE_PRODUCT thì mới cần check
      const shouldCheckMinOrderValue = voucher.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT

      if (shouldCheckMinOrderValue) {
        // Tính subtotal trực tiếp từ orderItems sau promotion, không sử dụng calculations để tránh circular dependency
        const subtotalAfterPromotion = orderItems.reduce((total, item) => {
          const original = item?.originalPrice
          const afterPromotion = (original || 0) - (item.promotionDiscount || 0)
          return total + afterPromotion * item.quantity
        }, 0)

        if (subtotalAfterPromotion < (voucher.minOrderValue || 0)) {
          removeVoucher()
          showErrorToast(1004)
        }
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

  if (_.isEmpty(currentCartItems?.orderItems)) {
    return (
      <div className="container sm:py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
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
          <div className="flex items-center gap-1 pb-4">
            <CircleAlert size={14} className="text-destructive" />
            <span className="text-xs italic text-destructive">
              {t('order.selectTableNote')}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          {!isMobile ? (
            <div className="my-4">
              <div className="grid grid-cols-8 px-4 py-3 mb-4 text-sm font-thin rounded-md bg-muted-foreground/10">
                <span className="col-span-3">{t('order.product')}</span>
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
              <div className="flex flex-col gap-3 mb-2 border rounded-md">
                {currentCartItems?.orderItems.map((item) => (
                  <div
                    key={`${item.id}-${currentCartItems?.voucher?.slug || 'no-voucher'}`}
                    className="grid items-center w-full grid-cols-7 gap-4 p-4 pb-4 bg-white rounded-md sm:grid-cols-8 dark:bg-transparent"
                  >
                    {item?.image ? (
                      <img
                        src={publicFileURL + '/' + item?.image}
                        alt={item.name}
                        className="w-20 rounded-md sm:h-24 sm:w-36"
                      />) : (
                      <img src={ProductImage} alt={item.name} className="object-cover w-20 rounded-md rounded-t-md sm:h-24 sm:w-36" />
                    )}
                    <div className="grid flex-row items-center w-full col-span-7 gap-4">
                      <div
                        className="grid flex-row items-center w-full grid-cols-7 gap-4"
                      >
                        <div className="flex w-full col-span-2 gap-2">
                          <div className="flex flex-col items-center justify-start w-full gap-2 sm:flex-row sm:justify-center">
                            <div className="flex flex-col w-full gap-2">
                              <span className="w-full overflow-hidden text-xs font-bold truncate whitespace-nowrap sm:text-sm text-ellipsis">
                                {item.name}
                              </span>
                              <span className="relative inline-block text-xs sm:text-sm text-muted-foreground">
                                {(() => {
                                  const displayItem = displayItems.find(di => di.slug === item.slug)
                                  const original = item.originalPrice || 0
                                  const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                                  const finalPrice = displayItem?.finalPrice || 0

                                  const isSamePriceVoucher =
                                    currentCartItems?.voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                    currentCartItems?.voucher?.voucherProducts?.some(vp => vp.product?.slug === item.slug)

                                  const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                                  const displayPrice = isSamePriceVoucher
                                    ? finalPrice
                                    : hasPromotionDiscount
                                      ? priceAfterPromotion
                                      : original

                                  const shouldShowLineThrough =
                                    isSamePriceVoucher || hasPromotionDiscount

                                  const note = isSamePriceVoucher
                                    ? '(**)'
                                    : hasPromotionDiscount
                                      ? '(*)'
                                      : ''

                                  return (
                                    <div className="flex items-center gap-1">
                                      {shouldShowLineThrough && original !== finalPrice && (
                                        <span className="text-sm line-through">
                                          {formatCurrency(original)}
                                        </span>
                                      )}
                                      <span className="font-bold text-primary">
                                        {formatCurrency(displayPrice)}
                                      </span>
                                      {note && <span className="text-sm">{note}</span>}
                                    </div>
                                  )
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center col-span-2">
                          <QuantitySelector cartItem={item} />
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm font-semibold text-primary">
                            {(() => {
                              const displayItem = displayItems.find(di => di.slug === item.slug)
                              const original = item.originalPrice || 0
                              const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                              const finalPrice = displayItem?.finalPrice || 0
                              const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                              const shouldUseFinalPrice =
                                currentCartItems?.voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                currentCartItems?.voucher?.voucherProducts?.some(vp => vp.product?.slug === item.slug)

                              const displayPrice = shouldUseFinalPrice
                                ? finalPrice * item.quantity
                                : hasPromotionDiscount
                                  ? priceAfterPromotion * item.quantity
                                  : original * item.quantity

                              return (
                                <div className="flex justify-center gap-1">
                                  <span className="font-bold text-primary">
                                    {formatCurrency(displayPrice)}
                                  </span>
                                </div>
                              )
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-center col-span-1">
                          <DeleteCartItemDialog cartItem={item} />
                        </div>
                      </div>
                      <CartNoteInput cartItem={item} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <OrderNoteInput order={currentCartItems} />
                {/* Chú thích bên dưới order note */}
                <div className="p-3 border rounded-md bg-primary/10 border-primary">
                  <div className="flex items-start gap-2 text-sm text-primary">
                    <div className="flex-1">
                      <p className="text-xs text-primary">
                        <span className="font-extrabold">{t('order.voucher')}</span>
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-primary">
                        <li className="flex items-center gap-1">
                          <span className="font-bold text-primary">*</span>
                          <span>{t('order.promotionDiscount')}</span>
                        </li>
                        <li className="flex items-center gap-1">
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
                  {/* <span className="text-xs text-muted-foreground">
                  {t('order.voucher')}
                </span> */}
                </div>
                <VoucherListSheet />
              </div>
              <div>
                {currentCartItems?.voucher && (
                  <div className="flex justify-start w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {t('order.usedVoucher')}:
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold border rounded-full border-primary bg-primary/20 text-primary">
                          -{`${formatCurrency(cartTotals.voucherDiscount)}`}
                        </span>
                      </div>

                      {/* Hiển thị nội dung chi tiết theo loại voucher */}
                      <div className="mt-1 text-xs italic text-muted-foreground">
                        {(() => {
                          const voucher = currentCartItems?.voucher
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
              <div className="flex flex-col items-end justify-between p-4 pt-4 mt-4 bg-white border rounded-md dark:bg-transparent">
                <div className="flex flex-col items-start justify-between w-full">
                  <div className="flex flex-col w-full gap-2 text-sm text-muted-foreground">

                    {/* Tổng giá gốc */}
                    <div className="flex justify-between">
                      <span>{t('order.subtotalBeforeDiscount')}</span>
                      <span>{formatCurrency(cartTotals.subTotalBeforeDiscount)}</span>
                    </div>

                    {/* Giảm giá khuyến mãi (promotion) */}
                    {cartTotals.promotionDiscount > 0 && (
                      <div className="flex justify-between italic text-muted-foreground/40">
                        <span>{t('order.promotionDiscount')}</span>
                        <span>-{formatCurrency(cartTotals.promotionDiscount)}</span>
                      </div>
                    )}

                    {/* Tổng giảm giá voucher */}
                    {cartTotals.voucherDiscount > 0 && (
                      <div className="flex justify-between italic text-green-600">
                        <span>{t('order.voucherDiscount')}</span>
                        <span>-{formatCurrency(cartTotals.voucherDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs italic text-muted-foreground/80">
                      <span>({t('order.partialAppliedNote')})</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 font-semibold border-t text-md">
                      <span>{t('order.totalPayment')}</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotals.finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-4">
              <div className="flex flex-col gap-2 mb-2 border rounded-md">
                {currentCartItems?.orderItems.map((item) => (
                  <div
                    key={`${item.id}-${currentCartItems?.voucher?.slug || 'no-voucher'}`}
                    className="flex flex-col items-center w-full gap-4 p-3 bg-white border rounded-md dark:bg-transparent"
                  >
                    <div className="flex items-center w-full h-24 gap-2">
                      {item?.image ? (
                        <img
                          src={publicFileURL + '/' + item?.image}
                          alt={item.name}
                          className="w-20 rounded-md sm:h-24 sm:w-36"
                        />) : (
                        <img src={ProductImage} alt={item.name} className="object-cover w-20 rounded-md rounded-t-md sm:h-24 sm:w-36" />
                      )}
                      <div className="flex flex-col justify-between w-full h-full gap-1">
                        <div className='flex items-start justify-between w-full h-full'>
                          <div className='flex items-center justify-between w-full'>
                            <span className="w-full overflow-hidden text-[18px] font-bold truncate whitespace-nowrap sm:text-sm text-ellipsis">
                              {item.name}
                            </span>
                            <DeleteCartItemDialog cartItem={item} />
                          </div>
                        </div>
                        <ProductVariantSelect variant={item.allVariants} onChange={handleChangeVariant} />
                        <div className="flex items-center justify-between w-full">
                          <span className="relative inline-block text-xs sm:text-sm text-muted-foreground">
                            {(() => {
                              const displayItem = displayItems.find(di => di.slug === item.slug)
                              const original = item.originalPrice || 0
                              const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                              const finalPrice = displayItem?.finalPrice || 0

                              const isSamePriceVoucher =
                                currentCartItems?.voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                currentCartItems?.voucher?.voucherProducts?.some(vp => vp.product?.slug === item.slug)

                              const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                              const displayPrice = isSamePriceVoucher
                                ? finalPrice
                                : hasPromotionDiscount
                                  ? priceAfterPromotion
                                  : original

                              const shouldShowLineThrough =
                                isSamePriceVoucher || hasPromotionDiscount

                              const note = isSamePriceVoucher
                                ? '(**)'
                                : hasPromotionDiscount
                                  ? '(*)'
                                  : ''

                              return (
                                <div className="flex items-center gap-1">
                                  {shouldShowLineThrough && original !== finalPrice && (
                                    <span className="text-[0.5rem] line-through sm:text-sm">
                                      {formatCurrency(original)}
                                    </span>
                                  )}
                                  <span className="font-bold text-primary">
                                    {formatCurrency(displayPrice)}
                                  </span>
                                  {note && <span className="text-sm">{note}</span>}
                                </div>
                              )
                            })()}
                          </span>
                          <QuantitySelector cartItem={item} />
                        </div>
                      </div>
                    </div>
                    <CartNoteInput cartItem={item} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className='flex items-center justify-center bg-white border rounded-md dark:bg-transparent'>
                  <OrderNoteInput order={currentCartItems} />
                </div>
                {/* Chú thích bên dưới order note */}
                <div className="p-3 border rounded-md bg-muted-foreground/5 border-muted-foreground/40">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="flex-1">
                      <p className="text-xs">
                        <span className="font-extrabold">{t('order.voucher')}</span>
                      </p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li className="flex items-center gap-1">
                          <span className="font-bold">*</span>
                          <span className="text-muted-foreground/80">{t('order.promotionDiscount')}</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="font-bold">**</span>
                          <span className="text-muted-foreground/80">{t('order.itemLevelVoucher')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('order.voucher')}
                  </span>
                  {/* <span className="text-xs text-muted-foreground">
                {t('order.voucher')}
              </span> */}
                </div>
                <VoucherListSheet />
              </div>
              <div>
                {currentCartItems?.voucher && (
                  <div className="flex justify-start w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {t('order.usedVoucher')}:
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold border rounded-full border-primary bg-primary/20 text-primary">
                          -{`${formatCurrency(cartTotals.voucherDiscount)}`}
                        </span>
                      </div>

                      {/* Hiển thị nội dung chi tiết theo loại voucher */}
                      <div className="mt-1 text-xs italic text-muted-foreground">
                        {(() => {
                          const voucher = currentCartItems?.voucher
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
              <div className="flex flex-col items-end justify-between p-2 pt-4 mt-4 bg-white border rounded-md dark:bg-transparent">
                <div className="flex flex-col items-start justify-between w-full">
                  <div className="flex flex-col w-full gap-2 text-sm text-muted-foreground">

                    {/* Tổng giá gốc */}
                    <div className="flex justify-between">
                      <span>{t('order.subtotalBeforeDiscount')}</span>
                      <span>{formatCurrency(cartTotals.subTotalBeforeDiscount)}</span>
                    </div>

                    {/* Giảm giá khuyến mãi (promotion) */}
                    {cartTotals.promotionDiscount > 0 && (
                      <div className="flex justify-between italic text-muted-foreground/80">
                        <span>{t('order.promotionDiscount')}</span>
                        <span>-{formatCurrency(cartTotals.promotionDiscount)}</span>
                      </div>
                    )}

                    {/* Tổng giảm giá voucher */}
                    {cartTotals.voucherDiscount > 0 && (
                      <div className="flex justify-between italic text-green-600">
                        <span>{t('order.voucherDiscount')}</span>
                        <span>-{formatCurrency(cartTotals.voucherDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs italic text-muted-foreground/80">
                      <span>({t('order.partialAppliedNote')})</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 font-semibold border-t text-md">
                      <span>{t('order.totalPayment')}</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotals.finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Button */}

          {!isMobile ? (
            <div className='grid grid-cols-6'>
              <div className="col-span-1 col-start-6">
                <div className="flex justify-end w-full">
                  <CreateOrderDialog
                    disabled={
                      !currentCartItems ||
                      (currentCartItems?.type === OrderTypeEnum.AT_TABLE &&
                        !currentCartItems?.table)
                    }
                  />
                </div>
              </div>
            </div>

          ) : (
            <div className='fixed left-0 right-0 z-50 bg-white bottom-16'>
              <div className='grid items-center justify-between grid-cols-2 p-4'>
                <div className="flex items-center col-span-1 gap-1 font-semibold">
                  <span>{t('order.totalPayment')}</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(cartTotals.finalTotal)}</span>
                </div>
                <div className="flex justify-end w-full col-span-1 p-2">
                  <CreateOrderDialog
                    disabled={
                      !currentCartItems ||
                      (currentCartItems?.type === OrderTypeEnum.AT_TABLE &&
                        !currentCartItems?.table)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
