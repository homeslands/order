import _ from 'lodash'
import { Trash2, ShoppingCart, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, ScrollArea, Separator } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput, OrderNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { CreateCustomerDialog, CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { StaffVoucherListSheet } from '@/components/app/sheet'
import { VOUCHER_TYPE } from '@/constants'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const cartItems = useCartItemStore((state) => state.cartItems)
  const removeCartItem = useCartItemStore((state) => state.removeCartItem)

  const subTotal = _.sumBy(cartItems?.orderItems, (item) => item.price * item.quantity)
  const discount = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER ? subTotal * (cartItems?.voucher?.value || 0) / 100 : cartItems?.voucher?.value || 0
  const totalAfterDiscount = subTotal - discount

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col z-30 fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:w-[25%] xl:w-[25%] shadow-lg overflow-hidden bg-background transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 p-2 border-b backdrop-blur-sm shrink-0 bg-background/95">
        <div className='flex justify-between items-center'>
          <div className="flex gap-2 items-center">
            <Receipt size={20} className="text-primary" />
            <h1 className="text-lg font-semibold">{t('menu.order')}</h1>
          </div>
          {cartItems?.orderItems && (
            <CreateCustomerDialog />
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 scrollbar-hidden">
        {/* Order type and customer selection */}
        <div className="grid grid-cols-1 gap-3 px-2 py-3 border-b backdrop-blur-sm bg-background/95">
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
                  className="flex flex-col gap-1 p-3 rounded-lg border transition-colors border-primary/60 group bg-primary/5 hover:bg-accent/5"
                >
                  <div className="flex flex-row gap-3 items-start">
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-base font-semibold truncate">{item.name}</span>
                          <div className='flex justify-between items-center w-full'>
                            <div className="flex flex-col gap-1">
                              {item.promotionValue && item.promotionValue > 0 ? (
                                <div className="flex gap-2 items-center">
                                  <span className="text-sm text-muted-foreground">
                                    Size {item.size.toUpperCase()}
                                  </span>
                                  -
                                  <span className="text-sm">
                                    {`${formatCurrency(item.price)}`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-medium text-primary">
                                  {`${formatCurrency(item.price)}`}
                                </span>
                              )}
                            </div>
                            <div className='flex gap-3 items-center'>
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
                        </div>
                      </div>
                    </div>
                  </div>
                  <CartNoteInput cartItem={item} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[12rem] gap-4 text-muted-foreground"
              >
                <div className="p-2 rounded-full bg-muted/30">
                  <ShoppingCart className="w-12 h-12" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium">{tCommon('common.noData')}</p>
                  <p className="text-sm text-muted-foreground">Add items to your cart to get started</p>
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

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('menu.total')}</span>
                <span className='font-medium'>{`${formatCurrency(subTotal || 0)}`}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm italic text-green-600">
                    {t('order.voucher')}
                  </span>
                  <span className="text-sm italic text-green-600">
                    - {`${formatCurrency(discount)}`}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex flex-col gap-3 pt-2">
                <div className='flex justify-between items-center w-full'>
                  <span className="text-base font-semibold">{t('menu.subTotal')}</span>
                  <span className="text-2xl font-bold text-primary">
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
