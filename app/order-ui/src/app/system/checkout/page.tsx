import { useState } from 'react'
import { CircleAlert, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QuantitySelector } from '@/components/app/button'
import { ScrollArea, useSidebar } from '@/components/ui'
import { useCartItemStore } from '@/stores'
import { CartNoteInput } from '@/components/app/input'
import { CheckoutCartSheet } from '@/components/app/sheet'
import { DeleteCartItemDialog } from '@/components/app/dialog'
import { publicFileURL } from '@/constants'
import { useIsMobile } from '@/hooks'
import { CheckoutCartDrawer } from '@/components/app/drawer'
import { formatCurrency } from '@/utils'
import { SystemTableSelect } from '@/components/app/select'

export default function SystemCheckoutPage() {
  const { t } = useTranslation('menu')
  const [isCartOpen] = useState(true)
  const { getCartItems } = useCartItemStore()
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const isCollapsed = state === 'collapsed'
  const cartItems = getCartItems()

  return (
    <div
      className={`mb-10 flex flex-col ${
        isCartOpen && !isMobile ? 'w-full' : 'w-full'
      } ${isCollapsed ? 'pl-2' : ''}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-end gap-2 py-3">
        {isMobile && <CheckoutCartDrawer />}
      </div>

      <ScrollArea className="flex flex-col gap-2 pb-4">
        {/* Table list order items */}
        <div className="mb-4">
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
                        <span className="truncate font-bold">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {`${formatCurrency(item.price || 0)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <QuantitySelector cartItem={item} />
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-primary">
                      {`${formatCurrency((item.price || 0) * item.quantity)}`}
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

        {/* Checkout cart */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-1">
            <CircleAlert size={14} className="text-destructive" />
            <span className="text-xs italic text-destructive">
              {t('order.selectTableNote')}
            </span>
          </div>
          {!isMobile && (
            <div className="flex justify-end">
              <CheckoutCartSheet />
            </div>
          )}
        </div>

        {/* Table select */}
        <SystemTableSelect />
      </ScrollArea>
    </div>
  )
}
