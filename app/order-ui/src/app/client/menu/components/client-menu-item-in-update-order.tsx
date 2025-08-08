import moment from 'moment'
import { NavLink, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { IAddNewOrderItemRequest, IMenuItem, IOrderItem, IProduct, IProductVariant } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency, showToast } from '@/utils'
import { useAddNewOrderItem, useIsMobile } from '@/hooks'
import { PromotionTag } from '@/components/app/badge'
import { useOrderFlowStore } from '@/stores'

interface IClientMenuItemInUpdateOrderProps {
  item: IMenuItem
}

export function ClientMenuItemInUpdateOrder({ item }: IClientMenuItemInUpdateOrderProps) {
  const { t } = useTranslation('menu')
  const { t: tToast } = useTranslation('toast')
  const isMobile = useIsMobile()
  const { slug } = useParams()
  const { updatingData, addDraftItem } = useOrderFlowStore()
  const { mutate: addNewOrderItem, isPending: isPendingAddNewOrderItem } = useAddNewOrderItem()

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

  const handleAddNewOrderItem = (item: IOrderItem) => {
    const request: IAddNewOrderItemRequest = {
      quantity: item.quantity,
      variant: item.variant.slug,
      note: item.note ?? '',
      promotion: item.promotion ? item.promotion.slug : '',
      order: slug || '',
    }
    addNewOrderItem(request, {
      onSuccess: (response) => {
        const itemResponse = response.result
        const newItem = {
          ...itemResponse,
          name: itemResponse.variant.product.name,
          size: itemResponse.variant.size.name,
          productSlug: itemResponse.variant.product.slug,
          originalPrice: itemResponse.variant.price,
          promotion: itemResponse.promotion ? itemResponse.promotion : null,
          promotionValue: itemResponse.promotion ? itemResponse.promotion.value : 0,
          promotionDiscount: itemResponse.promotion ? itemResponse.promotion.type === 'per-product' ? (itemResponse.promotion.value * (itemResponse.variant.price ?? 0)) / 100 : 0 : 0,
          description: itemResponse.variant.product.description,
          isLimit: itemResponse.variant.product.isLimit,
          note: '',
        }
        addDraftItem(newItem)
      }
    })
  }

  const handleAddToCart = (product: IMenuItem) => {
    if (!product?.product?.variants || product?.product?.variants.length === 0) return;

    const variant: IProductVariant = {
      ...product.product.variants[0],
      product: product.product,
    }

    const timestamp = moment().valueOf()

    const orderItem: IOrderItem = {
      id: `item_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product.slug,
      productSlug: product.product.slug,
      image: product.product.image,
      name: product.product.name,
      quantity: 1,
      size: product.product.variants[0].size.name,
      allVariants: product.product.variants,
      variant: variant,
      originalPrice: product.product.variants[0].price,
      promotion: product.promotion ? product.promotion : null,
      promotionValue: product.promotion ? product.promotion.value : 0,
      description: product.product.description,
      isLimit: product.product.isLimit,
      note: '',
    }
    handleAddNewOrderItem(orderItem)
    showToast(tToast('toast.addSuccess'))
  }

  return (
    <div
      key={item.slug}
      className="flex flex-row sm:flex-col justify-between rounded-xl bg-white border transition-all duration-300 ease-in-out min-h-[8rem] sm:min-h-[16rem] dark:bg-transparent"
    >
      <NavLink
        to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}
        className="flex flex-row w-full sm:flex-col"
      >
        <div className="relative flex-shrink-0 justify-center items-center px-2 py-4 w-24 h-full sm:p-0 sm:w-full sm:h-40">
          {item.product.image ? (
            <>
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full h-full rounded-xl p-1.5 sm:h-40"
              />
              {item?.product?.isLimit && !isMobile && (
                <span className="absolute bottom-3 left-3 z-50 px-3 py-1 text-xs text-white rounded-full bg-primary w-fit">
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
            <h3 className="font-bold text-md sm:text-lg line-clamp-1">{item.product.name}</h3>
            {item?.product?.isLimit && isMobile && (
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
            <span className="text-sm font-bold text-primary">
              {t('menu.contactForPrice')}
            </span>
          )}
        </div>
      </NavLink>

      <div className="flex justify-end items-end p-2 sm:w-full">
        {!item.isLocked && (item.currentStock > 0 || !item?.product?.isLimit) ? (
          isMobile ? (
            <Button disabled={!updatingData || isPendingAddNewOrderItem} onClick={() => handleAddToCart(item)} className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
              <Plus className='icon' />
            </Button>
          ) : (
            <Button
              className="flex gap-1 justify-center items-center w-full text-xs text-white rounded-full shadow-none xl:text-sm"
              onClick={() => handleAddToCart(item)}
              disabled={!updatingData || isPendingAddNewOrderItem}
            >
              {t('menu.addToCart')}
            </Button>
            // <AddNewOrderItemDialog product={item} />
          )
        ) : (
          <Button
            className="px-3 py-1 w-full text-xs font-semibold text-white bg-red-500 rounded-full"
            disabled
          >
            {t('menu.outOfStock')}
          </Button>
        )}
      </div>
    </div>
  )
}
