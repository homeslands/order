import _ from 'lodash'
import { useEffect } from 'react'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, ScrollArea } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput, OrderNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { CreateCustomerDialog, CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency, showErrorToast, showToast } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { StaffVoucherListSheet } from '@/components/app/sheet'
import { VOUCHER_TYPE } from '@/constants'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const cartItems = useCartItemStore((state) => state.cartItems)
  const { removeVoucher } = useCartItemStore()
  const removeCartItem = useCartItemStore((state) => state.removeCartItem)

  // use useEffect to check if subtotal is less than minOrderValue of voucher
  useEffect(() => {
    if (cartItems) {
      const subtotal = cartItems.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
      const voucher = cartItems.voucher
      if (subtotal < (voucher?.minOrderValue || 0)) {
        removeVoucher()
        showErrorToast(1004)
      }
    }
  }, [cartItems, removeVoucher])

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER ? subTotal * (cartItems?.voucher?.value || 0) / 100 : cartItems?.voucher?.value || 0
  const totalAfterDiscount = subTotal - discount

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  // check if customer info is removed, then check if voucher.isVerificationIdentity is true, then show toast
  useEffect(() => {
    const hasNoCustomerInfo = !cartItems?.ownerFullName && !cartItems?.ownerPhoneNumber
    const isPrivateVoucher = cartItems?.voucher?.isVerificationIdentity === true

    if (hasNoCustomerInfo && isPrivateVoucher) {
      showToast(tToast('toast.voucherVerificationIdentity'))
      removeVoucher()
    }
  }, [
    cartItems?.ownerFullName,
    cartItems?.ownerPhoneNumber,
    cartItems?.voucher?.isVerificationIdentity,
    tToast,
    removeVoucher
  ])

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col z-30 fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:w-[26%] xl:w-[25%] shadow-lg overflow-hidden bg-background transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 p-2 backdrop-blur-sm shrink-0 bg-background/95">
        <div className='flex items-center'>
          {/* <div className="flex gap-2 items-center">
            <Receipt size={20} className="text-primary" />
            <h1 className="text-sm font-semibold">{t('menu.order')}</h1>
          </div> */}
          {cartItems?.orderItems && cartItems?.orderItems?.length > 0 && (
            <CreateCustomerDialog />
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-0 scrollbar-hidden">
        {/* Order type and customer selection */}
        <div className="grid grid-cols-1 gap-2 p-2 backdrop-blur-sm xl:pr-2 bg-background/95">
          <OrderTypeSelect />
          <CustomerSearchInput />
        </div>

        {/* Selected Table */}
        {/* {cartItems?.type === OrderTypeEnum.AT_TABLE && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-center px-4 py-3 text-sm border-b bg-muted/50"
          >
            {cartItems?.table ? (
              <div className='flex gap-2 items-center'>
                <p className="text-muted-foreground">{t('menu.selectedTable')}</p>
                <span className="px-3 py-1 font-medium text-white rounded-full shadow-sm bg-primary/90">
                  {t('menu.tableName')} {cartItems?.tableName}
                </span>
              </div>
            ) : (
              <p className="flex gap-2 items-center text-muted-foreground">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                {t('menu.noSelectedTable')}
              </p>
            )}
          </motion.div>
        )} */}
        <div className="flex flex-col gap-2 p-2">
          <AnimatePresence>
            {cartItems && cartItems?.orderItems?.length > 0 ? (
              cartItems?.orderItems?.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col gap-1 p-2 rounded-lg border transition-colors border-primary/80 group bg-primary/10"
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className='flex justify-between items-center'>
                      <div className='flex gap-1 items-end'>
                        <span className="text-[13px] xl:text-sm font-semibold truncate max-w-[9rem] xl:max-w-[15rem]">{item.name}</span>
                      </div>
                      <span className="text-[14px]">
                        {`${formatCurrency(item.price)}`}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className="text-[10px] text-muted-foreground">
                        ({item.size.toUpperCase()})
                      </span>
                      <QuantitySelector cartItem={item} />
                      <Button
                        title={t('common.remove')}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={18} className='icon text-destructive' />
                      </Button>
                    </div>
                  </div>
                  <CartNoteInput cartItem={item} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[12rem] gap-2 text-muted-foreground"
              >
                <div className="p-2 rounded-full bg-muted/30">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium">{tCommon('common.noData')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer - Payment */}
      {cartItems && cartItems?.orderItems?.length !== 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 p-2 border-t backdrop-blur-sm shrink-0 bg-background/95"
        >
          <div className='space-y-1'>
            <div className="flex flex-col">
              <OrderNoteInput order={cartItems} />
              <StaffVoucherListSheet />
            </div>

            {/* {cartItems?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex gap-2 items-center px-3 py-2 w-full rounded-lg border bg-primary/10 border-primary/40">
                  <span className='text-sm text-muted-foreground'>
                    {t('order.usedVoucher')}:
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-primary bg-primary/10">
                    -{`${formatCurrency(discount)}`}
                  </span>
                </div>
              </div>
            )} */}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground xl:text-sm">{t('menu.total')}</span>
                <span className='text-xs font-medium xl:text-sm'>{`${formatCurrency(subTotal || 0)}`}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs italic text-green-600">
                    {t('order.voucher')}
                  </span>
                  <span className="text-xs italic text-green-600">
                    - {`${formatCurrency(discount)}`}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className='flex justify-between items-center w-full'>
                  <span className="text-base font-semibold">{t('menu.subTotal')}</span>
                  <span className="text-xl font-bold text-primary">
                    {`${formatCurrency(totalAfterDiscount)}`}
                  </span>
                </div>
                <CreateOrderDialog
                  disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
