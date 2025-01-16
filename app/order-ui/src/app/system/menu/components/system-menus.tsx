import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { IProduct, ISpecificMenu } from '@/types'
import { publicFileURL } from '@/constants'
import { AddToCartDialog } from '@/components/app/dialog'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'

interface IMenuProps {
  menu: ISpecificMenu | undefined
  isLoading: boolean
}

export default function SystemMenus({ menu, isLoading }: IMenuProps) {
  const { t } = useTranslation('menu')

  const menuItems = menu?.menuItems

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

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-3 lg:grid-cols-3`}>
        {[...Array(8)].map((_, index) => (
          <SkeletonMenuList key={index} />
        ))}
      </div>
    )
  }

  if (!menuItems || menuItems.length === 0) {
    return <p className="text-center">{t('menu.noData')}</p>
  }

  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4`}>
      {menuItems.map((item) => (
        <div
          key={item.slug}
          className="flex flex-col rounded-xl border bg-white backdrop-blur-md"
        >
          {/* Image Section with Discount Tag */}
          <div className="relative">
            {item.product.image ? (
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="h-28 w-full rounded-t-md object-cover"
              />
            ) : (
              <div className="h-24 w-full rounded-t-md bg-muted/60" />
            )}

            {/* Discount Tag */}
            {/* {item.discount && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                  Giảm {item.discount}%
                </span>
              </div>
            )} */}
          </div>

          {/* Content Section - More compact */}
          <div className="flex flex-1 flex-col space-y-1.5 p-2">
            <h3 className="line-clamp-1 text-sm font-bold">
              {item.product.name}
            </h3>
            <p className="line-clamp-2 text-xs text-gray-500">
              {item.product.description}
            </p>

            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-col">
                {item.product.variants.length > 0 ? (
                  <div className="flex flex-col items-start justify-start gap-1">
                    <span className="text-sm font-bold text-primary">
                      {(() => {
                        const range = getPriceRange(item.product.variants)
                        if (!range) return '0đ'
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
              <AddToCartDialog product={item.product} />
            ) : (
              <Button
                className="flex w-full items-center justify-center rounded-full bg-red-500 py-2 text-sm font-semibold text-white"
                disabled
              >
                {t('menu.outOfStock')}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
