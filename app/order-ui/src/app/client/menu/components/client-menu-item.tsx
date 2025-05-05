import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { IMenuItem, IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { ClientAddToCartDialog } from '@/components/app/dialog'
import { ClientAddToCartDrawer } from '@/components/app/drawer'
import { useIsMobile } from '@/hooks'
import { PromotionTag } from '@/components/app/badge'

interface IClientMenuItemProps {
  item: IMenuItem
}

export function ClientMenuItem({ item }: IClientMenuItemProps) {
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
      className="flex flex-row sm:flex-col justify-between bg-white rounded-xl border backdrop-blur-md transition-all duration-300 ease-in-out border-muted-foreground/40 min-h-[8rem] sm:min-h-[22rem] dark:bg-transparent hover:scale-105"
    >
      {/* Image */}
      <NavLink
        to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}
        className="flex flex-row w-full sm:flex-col"
      >
        <div className="relative flex-shrink-0 justify-center items-center px-2 py-4 w-24 h-full sm:p-0 sm:w-full sm:h-48">
          {item.product.image ? (
            <>
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full h-full rounded-md sm:rounded-t-xl sm:rounded-b-none sm:h-48"
              />
              {item.promotion && item.promotion.value > 0 && (
                <PromotionTag promotion={item.promotion} />
              )}
            </>
          ) : (
            <div className="w-full h-full rounded-t-md bg-muted/60" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 justify-between p-2">
          <div className="h-auto sm:h-[5rem]">
            <h3 className="text-sm font-bold sm:text-lg line-clamp-1">{item.product.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {item.product.description}
            </p>
          </div>

          {item.product.variants.length > 0 ? (
            <div className="flex flex-col gap-1">
              {/* Prices */}
              <div className="flex flex-col">
                {item?.promotion?.value > 0 ? (
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-xs line-through text-muted-foreground/70">
                      {(() => {
                        const range = getPriceRange(item.product.variants)
                        if (!range) return formatCurrency(0)
                        return formatCurrency(range.min)
                      })()}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {(() => {
                        const range = getPriceRange(item.product.variants)
                        if (!range) return formatCurrency(0)
                        return formatCurrency(range.min * (1 - item.promotion.value / 100))
                      })()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {(() => {
                      const range = getPriceRange(item.product.variants)
                      if (!range) return formatCurrency(0)
                      return formatCurrency(range.min)
                    })()}
                  </span>
                )}
              </div>

              {/* Stock */}
              {item.product.isLimit && (
                <span className="text-[0.65rem] text-muted-foreground">
                  {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm font-bold text-primary">{t('menu.contactForPrice')}</span>
          )}
        </div>
      </NavLink>

      {/* Add to Cart / Out of Stock */}
      <div className="flex justify-end items-end p-2 sm:w-full">
        {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
          isMobile ? (
            <ClientAddToCartDrawer product={item} />
          ) : (
            <ClientAddToCartDialog product={item} />
          )
        ) : (
          <Button
            className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full"
            disabled
          >
            {t('menu.outOfStock')}
          </Button>
        )}
      </div>
    </div>

  )
}
