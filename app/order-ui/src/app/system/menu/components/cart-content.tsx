import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { CreateOrderDialog } from '@/components/app/dialog'
import { formatCurrency } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { getCartItems, removeCartItem } = useCartItemStore()

  const cartItems = getCartItems()

  // Tính tổng tiền
  const subtotal = useMemo(() => {
    return cartItems?.orderItems?.reduce((acc, orderItem) => {
      return acc + (orderItem.price || 0) * orderItem.quantity
    }, 0)
  }, [cartItems])

  const discount = 0 // Giả sử giảm giá là 0
  const total = useMemo(() => {
    return subtotal ? subtotal - discount : 0
  }, [subtotal, discount])

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  return (
    <div className="p-2">
      <div className="border-b pb-2">
        <h1 className="text-lg font-medium">{t('menu.order')}</h1>
      </div>

      {/* Order type selection */}
      <div className="mt-4">
        <OrderTypeSelect />
      </div>

      {/* Selected table */}
      {getCartItems()?.type === OrderTypeEnum.AT_TABLE && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          <p>Bàn đang chọn: </p>
          <p className="rounded bg-primary px-3 py-1 text-white">
            Bàn {getCartItems()?.tableName}
          </p>
        </div>
      )}

      {/* Cart Items */}
      <div className="mt-4 flex flex-col gap-4 space-y-2 py-2">
        {cartItems ? (
          cartItems?.orderItems?.map((item) => (
            <div key={item.slug} className="flex flex-col gap-4 border-b pb-4">
              <div
                key={`${item.slug}`}
                className="flex flex-row items-center gap-2 rounded-xl"
              >
                {/* Hình ảnh sản phẩm */}
                <img
                  src={`${publicFileURL}/${item.image}`}
                  alt={item.name}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-row items-start justify-between">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-bold">{item.name}</span>
                      <span className="text-xs font-thin text-muted-foreground">
                        {`${formatCurrency(item.price || 0)}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveCartItem(item.id)}
                    >
                      <Trash2 size={20} className="text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="flex w-full items-center justify-between text-sm font-medium">
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

      {/* Summary */}
      {cartItems?.orderItems?.length !== 0 && (
        <div className="border-t bg-background p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('menu.total')}</span>
              <span>{`${formatCurrency(subtotal || 0)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('menu.discount')}
              </span>
              <span className="text-xs text-green-600">
                - {`${formatCurrency(discount)}`}
              </span>
            </div>
            <div className="flex justify-between border-t py-4 font-medium">
              <span className="font-semibold">{t('menu.subTotal')}</span>
              <span className="text-2xl font-bold text-primary">
                {`${formatCurrency(total)}`}
              </span>
            </div>
          </div>

          {/* Order button */}
          <CreateOrderDialog disabled={!cartItems} />
        </div>
      )}
    </div>
  )
}
