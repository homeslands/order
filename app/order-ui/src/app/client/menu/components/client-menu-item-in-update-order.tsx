import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { IMenuItem, IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { AddNewOrderItemDialog } from '@/components/app/dialog'
import { ClientAddToCartDrawer } from '@/components/app/drawer'
import { useIsMobile } from '@/hooks'
import { PromotionTag } from '@/components/app/badge'

interface IClientMenuItemInUpdateOrderProps {
  onSuccess: () => void
  item: IMenuItem
}

export function ClientMenuItemInUpdateOrder({ onSuccess, item }: IClientMenuItemInUpdateOrderProps) {
  const { t } = useTranslation('menu')
  const isMobile = useIsMobile()

  const getPriceRange = (variants: IProduct['variants']) => {
    if (!variants || variants.length === 0) return null

    const prices = variants.map((v) => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      min: minPrice,
      max: maxPrice,
      isSinglePrice: minPrice === maxPrice,
    }
  }

  return (
    <div
      key={item.slug}
      className={`flex flex-col justify-between bg-white rounded-xl border backdrop-blur-md transition-all duration-300 ease-in-out min-h-[22rem] dark:bg-transparent hover:scale-105`}
    >
      <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
        {/* Image Section with Ribbon Discount Tag */}
        <div className="relative">
          {item.product.image ? (
            <>
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full h-36 rounded-t-md"
              />
              {/* Discount Ribbon Tag */}
              {/* <PromotionTag /> */}
              {/* {item.product.isTopSell && <PromotionTag promotion={item.promotion} />} */}
              {item.promotion && item.promotion.value > 0 && (
                <PromotionTag promotion={item.promotion} />
              )}
            </>
          ) : (
            <div className="w-full h-24 rounded-t-md bg-muted/60" />
          )}
        </div>
        {/* Content Section */}
        <div className="flex flex-col justify-between flex-1 p-2 min-h-[8rem]">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">
              {item.product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2">
              {item.product.description}
            </p>
          </div>

          <div className="flex gap-1 justify-between items-center">
            <div className="flex flex-col">
              {item.product.variants.length > 0 ? (
                <div className="flex flex-col gap-1 justify-start items-start">
                  <div className='flex flex-row gap-1 items-center'>
                    {item?.promotion?.value > 0 ? (
                      <div className="flex flex-row gap-2 items-center">
                        <span className="text-xs line-through sm:text-sm text-muted-foreground/70">
                          {(() => {
                            const range = getPriceRange(item.product.variants)
                            if (!range) return formatCurrency(0)
                            return formatCurrency(range.min)
                          })()}
                        </span>
                        <span className="text-sm font-bold sm:text-lg text-primary">
                          {(() => {
                            const range = getPriceRange(item.product.variants)
                            if (!range) return formatCurrency(0)
                            return formatCurrency(range.min * (1 - item.promotion.value / 100))
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold sm:text-lg text-primary">
                        {(() => {
                          const range = getPriceRange(item.product.variants)
                          if (!range) return formatCurrency(0)
                          return formatCurrency(range.min)
                        })()}
                      </span>
                    )}

                  </div>
                  {item?.product?.isLimit && <span className="text-[0.7rem] text-muted-foreground">
                    {t('menu.amount')}
                    {item.currentStock}/{item.defaultStock}
                  </span>}
                </div>
              ) : (
                <span className="text-sm font-bold text-primary">
                  {t('menu.contactForPrice')}
                </span>
              )}
            </div>
          </div>
        </div>
      </NavLink>

      {!item.isLocked && (item.currentStock > 0 || !item?.product?.isLimit) ? (
        <div className="flex gap-2 justify-center p-2 w-full">
          {isMobile ? (
            <ClientAddToCartDrawer product={item} onSuccess={onSuccess} isUpdateOrder={true} />
          ) : (
            <AddNewOrderItemDialog product={item} onSuccess={onSuccess} />
          )}
        </div>
      ) : (
        <div className="flex gap-2 justify-center p-2 w-full">
          <Button
            className="flex justify-center items-center py-2 w-full text-sm font-semibold text-white bg-red-500 rounded-full"
            disabled
          >
            {t('menu.outOfStock')}
          </Button>
        </div>
      )}
    </div>
  )
}
