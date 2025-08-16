import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { IProduct, ISpecificMenu } from '@/types'
import { publicFileURL } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { UpdateOrderItemDialog } from '@/components/app/dialog'

interface IMenuProps {
  onAddNewOrderItemSuccess: () => void
  menu: ISpecificMenu | undefined
  isLoading: boolean
}

export function MenusInUpdateOrder({ onAddNewOrderItemSuccess, menu, isLoading }: IMenuProps) {
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
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-3`}>
      {menuItems.map((item) => (
        <div
          key={item.slug}
          className="flex min-h-[20rem] flex-col rounded-xl border bg-white backdrop-blur-md"
        >
          {/* Image Section with Discount Tag */}
          <div className="relative">
            {item.product.image ? (
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full h-32 rounded-t-md"
              />
            ) : (
              <div className="w-full h-24 rounded-t-md bg-muted/60" />
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
          <div className="flex flex-col flex-1 justify-between p-2">
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
                    <span className="text-lg font-bold text-primary">
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
              <div className="flex justify-center items-end w-full">
                <UpdateOrderItemDialog onAddNewOrderItemSuccess={onAddNewOrderItemSuccess} product={item} />
              </div>
            ) : (
              <Button
                className="flex justify-center items-center py-2 w-full text-sm font-semibold text-white bg-red-500 rounded-full"
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
