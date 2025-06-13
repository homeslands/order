import moment from 'moment'
import _ from 'lodash'

import { useCartItemStore } from '@/stores'
import { VOUCHER_TYPE } from '@/constants'
import {
  ICartItem,
  IDisplayCartItem,
  IDisplayOrderItem,
  IOrderDetail,
  IVoucher,
  IVoucherInCart,
  IVoucherProduct,
} from '@/types'
export const setupAutoClearCart = () => {
  const { clearCart, getCartItems } = useCartItemStore.getState()
  const cartItems = getCartItems()

  if (cartItems) {
    // Check if cart should be cleared
    const expirationTime = localStorage.getItem('cart-expiration-time')
    if (expirationTime && moment().valueOf() > parseInt(expirationTime)) {
      clearCart()
      localStorage.removeItem('cart-expiration-time')
      return
    }

    // Set new expiration time if not exists
    if (!expirationTime) {
      const tomorrow = moment().add(1, 'day').startOf('day')
      localStorage.setItem(
        'cart-expiration-time',
        tomorrow.valueOf().toString(),
      )
    }

    // Set timeout for current session
    const timeUntilExpiration = parseInt(expirationTime!) - moment().valueOf()
    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        clearCart()
        localStorage.removeItem('cart-expiration-time')
      }, timeUntilExpiration)
    }
  }
}

export function calculateCartItemDisplay(
  cartItems: ICartItem | null,
  voucher: IVoucherInCart | null,
): IDisplayCartItem[] {
  if (!cartItems || !cartItems.orderItems) return []

  const voucherProductSlugs =
    voucher?.voucherProducts?.map((vp) => vp.product?.slug) || []

  const displayItems = cartItems.orderItems.map((item) => {
    const original = item.originalPrice ?? item.price ?? 0

    const promotionDiscount =
      item.promotionDiscount ??
      Math.round(original * ((item.promotionValue || 0) / 100))

    const priceAfterPromotion = Math.max(0, original - promotionDiscount)

    // Nếu là voucher SAME_PRICE_PRODUCT và áp dụng cho item này
    const shouldApplyItemVoucher =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
      voucherProductSlugs.includes(item.slug)
    const shouldApplyPercentOrderItemVoucher =
      voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
    const shouldApplyFixedValueItemVoucher =
      voucher?.type === VOUCHER_TYPE.FIXED_VALUE

    if (shouldApplyItemVoucher) {
      let newPrice = 0
      if (voucher.value <= 1) {
        newPrice = Math.round(original * (1 - voucher.value))
      } else {
        newPrice = Math.min(original, voucher.value)
      }

      const voucherDiscount = original - newPrice
      return {
        ...item,
        finalPrice: newPrice,
        priceAfterPromotion: priceAfterPromotion,
        promotionDiscount: promotionDiscount,
        voucherDiscount,
      }
    }

    if (shouldApplyPercentOrderItemVoucher) {
      const voucherDiscount = (voucher.value * (item?.price ?? 0)) / 100
      return {
        ...item,
        finalPrice: priceAfterPromotion,
        priceAfterPromotion: priceAfterPromotion,
        promotionDiscount: promotionDiscount,
        voucherDiscount,
      }
    }

    if (shouldApplyFixedValueItemVoucher) {
      const voucherDiscount = (item?.price ?? 0) - voucher.value
      return {
        ...item,
        priceAfterPromotion: priceAfterPromotion,
        finalPrice: priceAfterPromotion,
        promotionDiscount,
        voucherDiscount,
      }
    }

    return {
      ...item,
      finalPrice: priceAfterPromotion,
      priceAfterPromotion: priceAfterPromotion,
      promotionDiscount,
      voucherDiscount: 0,
    }
  })

  return displayItems
}

export function calculateOrderItemDisplay(
  orderItems: IOrderDetail[],
  voucher: IVoucher | null,
): IDisplayOrderItem[] {
  const voucherProductSlugs =
    voucher?.voucherProducts?.map((vp) => vp.product?.slug) || []

  const displayItems = orderItems.map((item) => {
    const price = item.variant?.price ?? 0
    const original = price
    const productSlug = item.variant?.product?.slug ?? ''

    // Tính giảm giá theo promotion nếu có
    let promotionDiscount = 0
    if (item.promotion?.type === 'per-product') {
      const promotionValue = item.promotion?.value || 0
      promotionDiscount = Math.round(price * (promotionValue / 100))
    }

    const priceAfterPromotion = Math.max(0, price - promotionDiscount)

    // Nếu item được áp dụng voucher SAME_PRICE_PRODUCT
    const shouldApplySamePriceVoucher =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
      voucherProductSlugs.includes(productSlug)

    let voucherDiscount = 0
    let finalPrice = original

    if (shouldApplySamePriceVoucher) {
      const newPrice = Math.min(original, voucher.value || 0)
      voucherDiscount = original - newPrice
      finalPrice = newPrice
    }

    // Với các loại voucher khác (PERCENT_ORDER, FIXED_VALUE), chưa tính ở đây (sẽ tính ở tổng)
    return {
      ...item,
      name: item.variant?.product?.name ?? '',
      productSlug,
      originalPrice: original,
      finalPrice,
      priceAfterPromotion,
      promotionDiscount,
      voucherDiscount,
    }
  })

  return displayItems
}

export function calculateCartTotals(
  displayItems: IDisplayCartItem[],
  voucher: IVoucherInCart | null,
) {
  const allowedProductSlugs =
    voucher?.voucherProducts?.map((vp) => vp.product?.slug) || []

  const subTotalBeforeDiscount = _.sumBy(
    displayItems,
    (item) => (item.originalPrice || 0) * item.quantity,
  )

  const promotionDiscount = _.sumBy(displayItems, (item) => {
    const isSamePriceAndIncluded =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
      allowedProductSlugs.includes(item.slug)

    // const promoDiscount = isSamePriceAndIncluded
    //   ? 0
    //   : item.promotionDiscount || 0
    // return promoDiscount * item.quantity
    const discount =
      !isSamePriceAndIncluded &&
      item.promotionDiscount &&
      item.promotionDiscount > 0
        ? item.promotionDiscount
        : 0

    return discount * (item.quantity || 0)
  })

  let voucherDiscount = 0

  if (voucher) {
    if (voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      voucherDiscount = _.sumBy(displayItems, (item) => {
        if (allowedProductSlugs.includes(item.slug)) {
          return (item.voucherDiscount || 0) * item.quantity
        }
        return 0
      })
    } else if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
      voucherDiscount =
        (voucher.value * (subTotalBeforeDiscount - promotionDiscount)) / 100
    } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      voucherDiscount = voucher.value || 0
    }
  }

  const finalTotal =
    subTotalBeforeDiscount - promotionDiscount - voucherDiscount

  return {
    subTotalBeforeDiscount,
    promotionDiscount,
    voucherDiscount,
    finalTotal,
  }
}

export function calculatePlacedOrderTotals(
  displayItems: IDisplayOrderItem[],
  voucher: IVoucher | null,
) {
  if (!displayItems || !displayItems.length) return null

  const allowedProductSlugs =
    voucher?.voucherProducts?.map((vp: IVoucherProduct) => vp.product?.slug) ||
    []

  const subTotalBeforeDiscount = displayItems.reduce(
    (sum: number, item: IDisplayOrderItem) =>
      sum + (item.originalPrice || 0) * (item.quantity || 0),
    0,
  )

  const promotionDiscount = displayItems.reduce(
    (sum: number, item: IDisplayOrderItem) => {
      const isSamePriceAndIncluded =
        voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
        allowedProductSlugs.includes(item.productSlug)

      const discount =
        !isSamePriceAndIncluded &&
        item.promotionDiscount &&
        item.promotionDiscount > 0
          ? item.promotionDiscount
          : 0

      return sum + discount * (item.quantity || 0)
    },
    0,
  )

  let voucherDiscount = 0

  if (voucher) {
    if (voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      voucherDiscount = displayItems.reduce(
        (sum: number, item: IDisplayOrderItem) => {
          if (allowedProductSlugs.includes(item.productSlug)) {
            return sum + (item.voucherDiscount || 0) * (item.quantity || 0)
          }
          return sum
        },
        0,
      )
    } else if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
      voucherDiscount =
        (voucher.value * (subTotalBeforeDiscount - promotionDiscount)) / 100
    } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      voucherDiscount = voucher.value || 0
    }
  }

  const finalTotal =
    subTotalBeforeDiscount - promotionDiscount - voucherDiscount

  return {
    subTotalBeforeDiscount,
    promotionDiscount,
    voucherDiscount,
    finalTotal,
  }
}

export function calculateVoucherDiscountFromOrder(
  orderItems: IOrderDetail[],
  voucher: IVoucher | null,
): number {
  if (!voucher || !orderItems?.length) return 0

  const originalTotal = orderItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  )

  let voucherDiscount = 0

  switch (voucher.type) {
    case VOUCHER_TYPE.PERCENT_ORDER:
      voucherDiscount = (originalTotal * (voucher.value || 0)) / 100
      break

    case VOUCHER_TYPE.SAME_PRICE_PRODUCT: {
      const voucherProductSlugs =
        voucher.voucherProducts?.map((vp) => vp.product.slug) || []

      for (const item of orderItems) {
        const productSlug = item.variant.product.slug
        const quantity = item.quantity
        const originalPrice = item.variant.price

        if (voucherProductSlugs.includes(productSlug)) {
          const diff = (originalPrice - voucher.value) * quantity
          if (diff > 0) voucherDiscount += diff
        }
      }
      break
    }

    case VOUCHER_TYPE.FIXED_VALUE:
      voucherDiscount = voucher.value || 0
      break

    default:
      voucherDiscount = 0
  }

  return voucherDiscount
}
