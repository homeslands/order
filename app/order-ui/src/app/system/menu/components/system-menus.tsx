import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { IProduct, ISpecificMenu } from '@/types'
import { publicFileURL } from '@/constants'
import { AddToCartDialog } from '@/components/app/dialog'
import { Badge, Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { useCatalogs, useIsMobile } from '@/hooks'
import { StaffAddToCartDrawer } from '@/components/app/drawer'

interface IMenuProps {
  menu: ISpecificMenu | undefined
  isLoading: boolean
}

export default function SystemMenus({ menu, isLoading }: IMenuProps) {
  const { t } = useTranslation('menu')
  const isMobile = useIsMobile()
  const { data: catalogs, isLoading: isLoadingCatalog } = useCatalogs()
  const menuItems = menu?.menuItems?.sort((a, b) => {
    // Đưa các mục không bị khóa lên trước
    if (a.isLocked !== b.isLocked) {
      return Number(a.isLocked) - Number(b.isLocked);
    }

    // Coi mục với currentStock = null là "còn hàng" khi isLimit = false
    const aInStock = (a.currentStock !== 0 && a.currentStock !== null) || !a.product.isLimit;
    const bInStock = (b.currentStock !== 0 && b.currentStock !== null) || !b.product.isLimit;

    // Đưa các mục còn hàng lên trước
    if (aInStock !== bInStock) {
      return Number(bInStock) - Number(aInStock); // Còn hàng trước hết hàng
    }
    if (a.product.catalog.name !== b.product.catalog.name) {
      return a.product.catalog.name.localeCompare(b.product.catalog.name)
    }
    return 0;
  });

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

  if (isLoading || isLoadingCatalog) {
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

  const groupedItems = catalogs?.result?.map(catalog => ({
    catalog,
    items: menuItems.filter(item => item.product.catalog.slug === catalog.slug),
  })) || [];
  groupedItems.sort((a, b) => b.items.length - a.items.length)

  return (
    <div className={`flex flex-col gap-4 pr-2`}>
      {groupedItems.map((group, index) => (
        group.items.length > 0 &&
        <div className='flex flex-col gap-4 mt-4'>
          <div className='text-lg font-extrabold uppercase primary-highlight'>{group.catalog.name}</div>
          <div className='grid grid-cols-2 gap-4 w-full sm:grid-cols-4' key={index}>
            {group.items.map((item) => (
              <div
                key={item.slug}
                className="flex flex-col justify-between rounded-xl min-h-[14rem] border backdrop-blur-md"
              >
                {/* Image Section with Discount Tag */}
                <div className="relative">
                  {item.product.image ? (
                    <img
                      src={`${publicFileURL}/${item.product.image}`}
                      alt={item.product.name}
                      className="object-cover w-full h-28 rounded-t-md"
                    />
                  ) : (
                    <div className="w-full h-28 rounded-t-md bg-muted/60" />
                  )}
                </div>

                {/* Content Section - More compact */}
                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                  <div className='flex flex-col gap-1'>
                    <h3 className="text-sm font-bold line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.product.description}
                    </p>
                    <div className="flex gap-1 items-center">
                      <div className="flex flex-col">
                        {item.product.variants.length > 0 ? (
                          <div className="flex flex-col gap-1 justify-start items-start">
                            <div className='flex flex-row gap-1 items-center'>
                              {item?.promotion?.value > 0 ? (
                                <div className='flex flex-col gap-1 justify-start items-start'>
                                  <span className="text-sm sm:text-lg text-primary">
                                    {(() => {
                                      const range = getPriceRange(item.product.variants)
                                      if (!range) return formatCurrency(0)
                                      return range.isSinglePrice
                                        ? `${formatCurrency((range.min) * (1 - item?.promotion?.value / 100))}` : `${formatCurrency(range.min * (1 - item?.promotion?.value / 100))}`
                                    })()}
                                  </span>
                                  <div className='flex flex-row gap-3 items-center w-full'>
                                    <span className="text-sm line-through text-muted-foreground/70 w-[30%]">
                                      {(() => {
                                        const range = getPriceRange(item.product.variants)
                                        if (!range) return formatCurrency(0)
                                        return range.isSinglePrice
                                          ? `${formatCurrency((range.min))}` : `${formatCurrency(range.min)}`
                                      })()}
                                    </span>
                                    {item?.promotion?.value > 0 && (
                                      <Badge className="text-[10px] bg-destructive hover:bg-destructive">
                                        {t('menu.discount')} {item?.promotion?.value}%
                                      </Badge>
                                    )}
                                  </div>

                                </div>) : (
                                <span className="text-sm font-bold sm:text-lg text-primary">
                                  {(() => {
                                    const range = getPriceRange(item.product.variants)
                                    if (!range) return formatCurrency(0)
                                    return range.isSinglePrice
                                      ? `${formatCurrency(range.min)}`
                                      : `${formatCurrency(range.min)}`
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
                  {!item.isLocked && (item.currentStock > 0 || !item?.product?.isLimit) ? (
                    <div>
                      {isMobile ? (
                        <StaffAddToCartDrawer product={item} />
                      ) : (
                        <AddToCartDialog product={item} />
                      )}
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
        </div>
      ))}
    </div>
  )
}
