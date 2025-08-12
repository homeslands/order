import moment from 'moment'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { IMenuItem, IOrderItem, IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import ProductImage from '@/assets/images/ProductImage.png'
import { formatCurrency, showToast } from '@/utils'
import { ClientAddToCartDialog } from '@/components/app/dialog'
import { useIsMobile } from '@/hooks'
import { PromotionTag } from '@/components/app/badge'
import { OrderFlowStep, useOrderFlowStore, useUserStore } from '@/stores'


interface IClientMenuItemProps {
  item: IMenuItem
}

export function ClientMenuItem({ item }: IClientMenuItemProps) {
  const { t } = useTranslation('menu')
  const { t: tToast } = useTranslation('toast')
  const isMobile = useIsMobile()
  // 🔥 Sử dụng Order Flow Store
  const {
    currentStep,
    isHydrated,
    orderingData,
    initializeOrdering,
    addOrderingItem,
    setCurrentStep
  } = useOrderFlowStore()
  const { userInfo } = useUserStore();
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

  // 🚀 Đảm bảo đang ở ORDERING phase khi component mount
  useEffect(() => {
    if (isHydrated) {
      // Chuyển về ORDERING phase nếu đang ở phase khác
      if (currentStep !== OrderFlowStep.ORDERING) {
        setCurrentStep(OrderFlowStep.ORDERING)
      }

      // Khởi tạo ordering data nếu chưa có
      if (!orderingData) {
        initializeOrdering()
        return
      }

      // Chỉ re-initialize nếu user đã đăng nhập nhưng orderingData không có owner
      if (userInfo?.slug && !orderingData.owner?.trim()) {
        initializeOrdering()
      }
    }
  }, [isHydrated, currentStep, orderingData, userInfo?.slug, setCurrentStep, initializeOrdering])

  const handleAddToCart = (product: IMenuItem) => {
    if (!product?.product?.variants || product?.product?.variants.length === 0 || !isHydrated) return;

    // ✅ Step 2: Ensure ORDERING phase
    if (currentStep !== OrderFlowStep.ORDERING) {
      setCurrentStep(OrderFlowStep.ORDERING)
    }

    // Khởi tạo ordering data nếu chưa có
    if (!orderingData) {
      initializeOrdering()
      return
    }

    // Chỉ re-initialize nếu user đã đăng nhập nhưng orderingData không có owner
    if (userInfo?.slug && !orderingData.owner?.trim()) {
      initializeOrdering()
    }

    // ✅ Step 3: Create order item with proper structure
    const orderItem: IOrderItem = {
      id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product?.product?.slug,
      image: product?.product?.image,
      name: product?.product?.name,
      quantity: 1,
      size: product?.product?.variants[0]?.size?.name,
      allVariants: product?.product?.variants,
      variant: product?.product?.variants[0],
      originalPrice: product?.product?.variants[0]?.price,
      productSlug: product?.product?.slug,
      description: product?.product?.description,
      isLimit: product?.product?.isLimit,
      // promotionSlug: product?.promotion ? product?.promotion?.slug : undefined,
      promotion: product?.promotion ? product?.promotion : null,
      promotionValue: product?.promotion ? product?.promotion?.value : 0,
      note: '',
    }

    try {
      // ✅ Step 4: Add to ordering data
      addOrderingItem(orderItem)

      // ✅ Step 5: Success feedback
      showToast(tToast('toast.addSuccess'))

    } catch (error) {
      // ✅ Step 7: Error handling
      // eslint-disable-next-line no-console
      console.error('❌ Error adding item to cart:', error)
    }
  };

  return (
    <div
      key={item.slug}
      className="flex flex-row sm:flex-col justify-between bg-white border rounded-xl backdrop-blur-md sm:shadow-xl transition-all duration-300 ease-in-out min-h-[8rem] sm:min-h-[12rem] dark:bg-transparent dark:border-muted-foreground/30 dark:shadow-none"
    >
      {/* Image */}
      <NavLink
        to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}
      >
        <div className="relative flex-shrink-0 justify-center items-center p-2 w-32 h-full sm:p-0 sm:w-full sm:h-32">
          {item.product.image ? (
            <>
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full p-1.5 h-full rounded-xl sm:h-32"
              />
              {/* Stock */}
              {item.product.isLimit && !isMobile && (
                <span className="absolute bottom-3 left-3 z-50 px-3 py-1 text-xs text-white rounded-full bg-primary w-fit">
                  {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                </span>
              )}
              {item.promotion && item.promotion.value > 0 && (
                <PromotionTag promotion={item.promotion} />
              )}
            </>
          ) : (
            <img src={ProductImage} alt={item.product.name} className="object-cover p-1.5 w-full h-full rounded-xl" />
          )}
        </div>
      </NavLink>
      {/* Content */}
      <div className="flex flex-col flex-1 justify-between p-2">
        {/* Mobile: Name and Stock on same row */}
        {isMobile ? (
          <div className="flex flex-col gap-2 items-start">
            <h3 className="flex-1 font-bold text-md line-clamp-1">{item.product.name}</h3>
            {/* Stock */}
            {item.product.isLimit && (
              <span className="px-2 py-1 text-xs text-white whitespace-nowrap rounded-full bg-primary">
                {t('menu.amount')}{item.currentStock}/{item.defaultStock}
              </span>
            )}
          </div>
        ) : (
          <div className="h-auto sm:h-fit">
            <h3 className="font-bold text-md sm:text-lg line-clamp-1">{item.product.name}</h3>
          </div>
        )}

        {/* Mobile: Price and Button on same row (or just button if out of stock) */}
        {isMobile ? (
          <div className="flex flex-row justify-between items-center mt-2">
            {/* Only show price if not out of stock */}
            {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) && (
              <div className="flex-1">
                {item.product.variants.length > 0 ? (
                  item?.promotion?.value > 0 ? (
                    <div className="flex flex-col">
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
                  )
                ) : (
                  <span className="text-sm font-bold text-primary">{t('menu.contactForPrice')}</span>
                )}
              </div>
            )}

            {/* Button */}
            <div>
              {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
                <Button onClick={() => handleAddToCart(item)} className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
                  <Plus className='icon' />
                </Button>
              ) : (
                <Button
                  className="py-1 w-28 text-xs font-semibold text-white bg-red-500 rounded-full"
                  disabled
                >
                  {t('menu.outOfStock')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Desktop layout remains the same */
          item.product.variants.length > 0 ? (
            <div className="flex flex-col gap-1">
              {/* Prices */}
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
          )
        )}
      </div>


      {/* Add to Cart / Out of Stock - Desktop only */}
      {!isMobile && (
        <div className="flex justify-end items-end p-2 sm:w-full">
          {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
            <ClientAddToCartDialog product={item} />
          ) : (
            <Button
              className="px-3 py-1 w-full text-xs font-semibold text-white bg-red-500 rounded-full"
              disabled
            >
              {t('menu.outOfStock')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
