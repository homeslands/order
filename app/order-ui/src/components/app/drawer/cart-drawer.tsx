import { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
} from '@/components/ui'
import { useOrderFlowStore } from '@/stores'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput, OrderNoteInput } from '@/components/app/input'
import { APPLICABILITY_RULE, publicFileURL, VOUCHER_TYPE } from '@/constants'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, showErrorToast, showToast } from '@/utils'
import { cn } from '@/lib'
import { IUserInfo, OrderTypeEnum } from '@/types'
import { CreateCustomerDialog, CreateOrderDialog } from '../dialog'
import { OrderTypeSelect, SystemTableSelectInCartDrawer } from '../select'
import { StaffVoucherListSheet } from '../sheet'

export default function CartDrawer({ className = '' }: { className?: string }) {
  const { t } = useTranslation(['menu'])
  const { t: tVoucher } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tCommon } = useTranslation(['common'])
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  const [, setSelectedUser] = useState<IUserInfo | null>(null)
  const { removeVoucher, getCartItems, removeOrderingItem, removeOrderingCustomer } = useOrderFlowStore()
  const cartItems = getCartItems()

  const displayItems = calculateCartItemDisplay(
    cartItems,
    cartItems?.voucher || null
  )

  const cartTotals = calculateCartTotals(displayItems, cartItems?.voucher || null)

  useEffect(() => {
    if (cartItems?.voucher && cartItems.voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      const voucherProductSlugs = cartItems.voucher.voucherProducts?.map(vp => vp.product.slug) || []
      const hasValidProducts = cartItems.orderItems.some(item => voucherProductSlugs.includes(item.slug))

      if (!hasValidProducts) {
        showErrorToast(143422)
        removeVoucher()
      }
    }
  }, [cartItems, removeVoucher])

  useEffect(() => {
    if (cartItems && cartItems.voucher) {
      const { voucher, orderItems } = cartItems

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
  }, [cartItems, removeVoucher])

  const handleRemoveCartItem = (id: string) => {
    removeOrderingItem(id)
  }

  // check if customer info is removed, then check if voucher.isVerificationIdentity is true, then show toast
  useEffect(() => {
    const hasNoCustomerInfo = !cartItems?.ownerFullName && !cartItems?.ownerPhoneNumber
    const isPrivateVoucher = cartItems?.voucher?.isVerificationIdentity === true

    if (hasNoCustomerInfo && isPrivateVoucher) {
      showToast(tToast('toast.voucherVerificationIdentity'))
      removeOrderingCustomer()
      removeVoucher()
    }
  }, [
    cartItems?.ownerFullName,
    cartItems?.ownerPhoneNumber,
    cartItems?.voucher?.isVerificationIdentity,
    tToast,
    removeVoucher,
    removeOrderingCustomer
  ])

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
        <div className="pb-8">
          <DrawerHeader>
            <DrawerTitle>{t('menu.order')}</DrawerTitle>
            <DrawerDescription>{t('menu.orderDescription')}</DrawerDescription>

          </DrawerHeader>
          {cartItems && cartItems?.orderItems?.length > 0 ? (
            <ScrollArea className='h-[35%] px-4'>
              {cartItems && cartItems?.orderItems?.length > 0 && (
                <div className="flex flex-col gap-2">
                  {/* Order type selection */}
                  <div className="flex flex-col gap-2">
                    <CreateCustomerDialog />
                    <CustomerSearchInput />
                    <div className='grid grid-cols-2 gap-1'>
                      <OrderTypeSelect />
                      {/* <span className='text-sm text-muted-foreground'>
                      {t('menu.table')}
                    </span> */}
                      <SystemTableSelectInCartDrawer />
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
                </div>
              )}
              <div className="overflow-y-scroll [&::-webkit-scrollbar]:hidden scrollbar-hidden flex flex-col gap-4 py-2 space-y-2">
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
                              <span className="font-bold truncate max-w-[13rem]">
                                {item.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Size {item.size && item.size.toUpperCase()} - {`${formatCurrency(displayItems.find(di => di.slug === item.slug)?.finalPrice || 0)}`}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => handleRemoveCartItem(item.id)}
                            >
                              <Trash2 className="text-destructive" />
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
              <OrderNoteInput order={cartItems} />
              <StaffVoucherListSheet />
              <div>
                {cartItems?.voucher && (
                  <div className="flex justify-start w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex gap-2 items-center mt-2">
                        <Badge variant='outline' className="text-[10px] px-1 border-primary text-primary">
                          {(() => {
                            const voucher = cartItems?.voucher
                            if (!voucher) return null

                            const { type, value, applicabilityRule: rule } = voucher

                            // Mô tả phần giá trị khuyến mãi
                            const discountValueText =
                              type === VOUCHER_TYPE.PERCENT_ORDER
                                ? tVoucher('voucher.percentDiscount', { value }) // "Giảm {value}%"
                                : type === VOUCHER_TYPE.FIXED_VALUE
                                  ? tVoucher('voucher.fixedDiscount', { value: formatCurrency(value) }) // "Giảm {value}₫"
                                  : type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                                    ? tVoucher('voucher.samePriceProduct', { value: formatCurrency(value) }) // "Đồng giá {value}₫"
                                    : ''

                            // Mô tả điều kiện áp dụng (rule)
                            const ruleText =
                              rule === APPLICABILITY_RULE.ALL_REQUIRED
                                ? tVoucher(
                                  type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                                    ? 'voucher.requireAllSamePrice'
                                    : type === VOUCHER_TYPE.PERCENT_ORDER
                                      ? 'voucher.requireAllPercent'
                                      : 'voucher.requireAllFixed'
                                )
                                : rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED
                                  ? tVoucher(
                                    type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                                      ? 'voucher.requireAtLeastOneSamePrice'
                                      : type === VOUCHER_TYPE.PERCENT_ORDER
                                        ? 'voucher.requireAtLeastOnePercent'
                                        : 'voucher.requireAtLeastOneFixed'
                                  )
                                  : ''

                            return `${discountValueText} ${ruleText}`
                          })()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
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
                    <span>{`${formatCurrency(cartTotals.subTotalBeforeDiscount)}`}</span>
                  </div>
                  {cartTotals.promotionDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="italic text-yellow-600">
                        {t('order.promotionDiscount')}:&nbsp;
                      </span>
                      <span className="italic text-yellow-600">
                        -{`${formatCurrency(cartTotals.promotionDiscount)}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="italic text-green-600">
                      {t('menu.voucher')}
                    </span>
                    <span className="text-sm italic text-green-600">
                      - {`${formatCurrency(cartTotals.voucherDiscount)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 font-medium border-t">
                    <span className="font-semibold">{t('menu.subTotal')}</span>
                    <span className="text-lg font-bold text-primary">
                      {`${formatCurrency(cartTotals.finalTotal)}`}
                    </span>
                  </div>
                </div>
                {/* Order button */}
                <div className='flex gap-4 justify-end mt-2 w-full h-24'>
                  <div className='grid grid-cols-2 gap-2 items-center w-full h-fit'>
                    <DrawerClose ref={drawerCloseRef} asChild>
                      <Button
                        variant="outline"
                        className="rounded-full"
                      >
                        {tCommon('common.close')}
                      </Button>
                    </DrawerClose>
                    <div className='flex justify-end w-full'>
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
