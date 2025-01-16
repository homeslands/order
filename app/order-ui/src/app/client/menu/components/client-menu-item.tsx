import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { IMenuItem, IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { ClientAddToCartDialog } from '@/components/app/dialog'
import { ClientAddToCartCart } from '@/components/app/drawer'
import { useIsMobile } from '@/hooks'

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
    // <NavLink key={item.slug} to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
    <div
      key={item.slug}
      className="flex min-h-[20rem] flex-col rounded-xl border bg-white backdrop-blur-md transition-all duration-300"
    >
      {/* Image Section with Discount Tag */}
      <div className="relative">
        {item.product.image ? (
          <img
            src={`${publicFileURL}/${item.product.image}`}
            alt={item.product.name}
            className="object-cover w-full h-36 rounded-t-md"
          />
        ) : (
          <div className="w-full h-24 rounded-t-md bg-muted/60" />
        )}
      </div>

      {/* Content Section - More compact */}
      <div className="flex flex-col justify-between flex-1 p-2">
        <div>
          <h3 className="text-lg font-bold line-clamp-1">
            {item.product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">
            {item.product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col">
            {item.product.variants.length > 0 ? (
              <div className="flex flex-col items-start justify-start gap-1">
                <span className="text-sm font-bold sm:text-lg text-primary">
                  {(() => {
                    const range = getPriceRange(item.product.variants)
                    if (!range) return formatCurrency(0)
                    return range.isSinglePrice
                      ? `${formatCurrency(range.min)}`
                      : `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
                  })()}
                </span>
                <span className="text-[0.7rem] text-muted-foreground">
                  {t('menu.amount')}
                  {item.currentStock}/{item.defaultStock}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-primary">
                {t('menu.contactForPrice')}
              </span>
            )}
          </div>
        </div>
        {item.currentStock > 0 ? (
          <div className="flex items-end justify-between w-full gap-2">
            <NavLink className="flex flex-1" to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
              <Button variant="outline" className='w-full text-xs rounded-full sm:text-sm'>{t('order.viewDetail')}</Button>
            </NavLink>
            {isMobile ? (
              <ClientAddToCartCart product={item.product} />
            ) : (
              <ClientAddToCartDialog product={item.product} />
            )}
          </div>
        ) : (
          <Button
            className="flex items-center justify-center w-full py-2 text-sm font-semibold text-white bg-red-500 rounded-full"
            disabled
          >
            {t('menu.outOfStock')}
          </Button>
        )}
      </div>
    </div>
    // </NavLink>
  )
}
