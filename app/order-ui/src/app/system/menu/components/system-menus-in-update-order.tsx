import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { IProduct, ISpecificMenu } from '@/types'
import { publicFileURL } from '@/constants'
import { SystemAddToCurrentOrderDialog } from '@/components/app/dialog'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { useCatalogs, useIsMobile } from '@/hooks'
import { SystemAddToCartDrawer } from '@/components/app/drawer'
import { PromotionTag } from '@/components/app/badge'

interface IMenuProps {
  menu: ISpecificMenu | undefined
  isLoading: boolean
  onSuccess: () => void
}

export default function SystemMenusInUpdateOrder({ menu, isLoading, onSuccess }: IMenuProps) {
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
    <div className="flex flex-col gap-4">
      {groupedItems.map((group, index) => (
        group.items.length > 0 &&
        <div key={index} className='flex flex-col gap-4 mt-4'>
          <div className='text-lg font-extrabold uppercase primary-highlight'>{group.catalog.name}</div>
          <div className='grid grid-cols-2 gap-4 w-full sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'>
            {group.items.map((item) => (
              <div
                key={item.slug}
                className="flex flex-row sm:flex-col justify-between bg-white rounded-xl backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out min-h-[8rem] sm:min-h-[16rem] dark:bg-transparent hover:scale-105"
              >
                <div className="flex flex-row w-full sm:flex-col">
                  <div className="relative flex-shrink-0 justify-center items-center px-2 py-4 w-24 h-full sm:p-0 sm:w-full sm:h-40">
                    {item.product.image ? (
                      <>
                        <img
                          src={`${publicFileURL}/${item.product.image}`}
                          alt={item.product.name}
                          className="object-cover w-full h-full rounded-md sm:rounded-t-xl sm:rounded-b-none sm:h-40"
                        />
                        {item.product.isLimit && !isMobile && (
                          <span className="absolute bottom-1 left-1 z-50 px-3 py-1 text-xs text-white rounded-full bg-primary w-fit">
                            {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                          </span>
                        )}
                        {item.promotion && item.promotion.value > 0 && (
                          <PromotionTag promotion={item.promotion} />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full rounded-t-md bg-muted/60" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between p-2">
                    <div className="h-auto sm:h-fit">
                      <h3 className="font-bold text-md sm:text-md line-clamp-1">{item.product.name}</h3>
                      {item.product.isLimit && isMobile && (
                        <span className="px-3 py-1 mt-1 text-xs text-white rounded-full bg-primary w-fit">
                          {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                        </span>
                      )}
                    </div>

                    {item.product.variants.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
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
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-primary">{t('menu.contactForPrice')}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-end p-2 sm:w-full">
                  {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
                    isMobile ? (
                      <SystemAddToCartDrawer isUpdateOrder={true} product={item} onSuccess={onSuccess} />
                    ) : (
                      <SystemAddToCurrentOrderDialog product={item} onSuccess={onSuccess} />
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
