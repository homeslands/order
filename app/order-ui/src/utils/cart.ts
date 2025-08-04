import moment from 'moment'
import _ from 'lodash'

import { useCartItemStore } from '@/stores'
import { APPLICABILITY_RULE, VOUCHER_TYPE } from '@/constants'
import {
  ICartItem,
  IDisplayCartItem,
  IDisplayOrderItem,
  IOrderDetail,
  IOrderItem,
  IPromotion,
  IVoucher,
  IVoucherProduct,
} from '@/types'

// Transform IOrderItem to IOrderDetail for calculation compatibility
export function transformOrderItemToOrderDetail(
  orderItems: IOrderItem[],
): IOrderDetail[] {
  return orderItems.map((item) => ({
    id: item.id,
    slug: item.slug,
    createdAt: new Date().toISOString(),
    note: item.note || '',
    quantity: item.quantity,
    status: {
      PENDING: 0,
      COMPLETED: 0,
      FAILED: 0,
      RUNNING: 0,
    },
    subtotal: (item.originalPrice || 0) * item.quantity,
    variant: item.variant,
    size: item.variant.size,
    trackingOrderItems: [],
    promotion: item.promotion
      ? ({
          slug:
            typeof item.promotion === 'string'
              ? item.promotion
              : item.promotion.slug,
          createdAt: new Date().toISOString(),
          title: '',
          branchSlug: '',
          description: '',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          value: item.promotionValue || 0,
          type: 'per-product',
        } as IPromotion)
      : undefined,
  }))
}

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

function isVoucherApplicable(cartItems: ICartItem, voucher: IVoucher): boolean {
  if (!voucher.voucherProducts || voucher.voucherProducts.length === 0)
    return true

  const cartSlugs = cartItems.orderItems.map((item) => item.slug)
  const requiredSlugs = voucher.voucherProducts.map((vp) => vp.product?.slug)

  const matchedCount = requiredSlugs.filter((slug) =>
    cartSlugs.includes(slug),
  ).length

  if (voucher.applicabilityRule === APPLICABILITY_RULE.ALL_REQUIRED) {
    return matchedCount === requiredSlugs.length
  }

  if (voucher.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
    return matchedCount > 0
  }

  return false
}

export function isVoucherApplicableFromOrderDetails(
  orderItems: IOrderDetail[],
  voucher: IVoucher,
): boolean {
  if (!voucher.voucherProducts || voucher.voucherProducts.length === 0)
    return true

  const cartSlugs = orderItems.map((item) => item.variant?.product?.slug ?? '')
  const requiredSlugs = voucher.voucherProducts.map(
    (vp) => vp.product?.slug ?? '',
  )

  const matchedCount = requiredSlugs.filter((slug) =>
    cartSlugs.includes(slug),
  ).length

  if (voucher.applicabilityRule === APPLICABILITY_RULE.ALL_REQUIRED) {
    return matchedCount === requiredSlugs.length
  }

  if (voucher.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
    return matchedCount > 0
  }

  return false
}

export function calculateCartItemDisplay(
  cartItems: ICartItem | null,
  voucher: IVoucher | null,
): IDisplayCartItem[] {
  if (!cartItems || !cartItems.orderItems) return []

  const isVoucherValid = voucher
    ? isVoucherApplicable(cartItems, voucher)
    : false
  const rule = voucher?.applicabilityRule
  const type = voucher?.type
  const orderItems = cartItems.orderItems

  const inVoucherList = (item: IOrderItem) =>
    voucher?.voucherProducts?.some((vp) => vp.product?.slug === item.slug)

  const eligibleItems = voucher ? orderItems.filter(inVoucherList) : []

  return orderItems.map((item) => {
    const original = item.originalPrice ?? 0

    const promotionDiscount =
      item.promotionDiscount ??
      Math.round(original * ((item.promotionValue || 0) / 100))

    const priceAfterPromotion = Math.max(0, original - promotionDiscount)
    const isEligible = inVoucherList(item)

    // ========== Không có voucher hoặc không hợp lệ ==========
    if (!isVoucherValid) {
      return {
        ...item,
        finalPrice: priceAfterPromotion,
        priceAfterPromotion,
        promotionDiscount,
        voucherDiscount: 0,
      }
    }

    // ========== RULE: ALL_REQUIRED ==========
    if (rule === APPLICABILITY_RULE.ALL_REQUIRED) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        const voucherDiscount = (voucher?.value || 0 * original) / 100
        return {
          ...item,
          finalPrice: priceAfterPromotion,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const voucherDiscount = voucher?.value || 0 / orderItems.length
        return {
          ...item,
          finalPrice: priceAfterPromotion,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT && isEligible) {
        const newPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)

        const voucherDiscount = original - newPrice
        return {
          ...item,
          finalPrice: newPrice,
          priceAfterPromotion,
          promotionDiscount: 0, // bỏ qua promotion
          voucherDiscount,
        }
      }

      // Nếu SAME_PRICE_PRODUCT nhưng item không nằm trong list thì giữ nguyên
      return {
        ...item,
        finalPrice: priceAfterPromotion,
        priceAfterPromotion,
        promotionDiscount,
        voucherDiscount: 0,
      }
    }

    // ========== RULE: AT_LEAST_ONE_REQUIRED ==========
    if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED && isEligible) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        const voucherDiscount = (voucher?.value || 0 * original) / 100
        const finalPrice = original - voucherDiscount
        return {
          ...item,
          finalPrice,
          priceAfterPromotion: original, // không áp dụng promotion
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const numEligible = eligibleItems.length || 1 // tránh chia 0
        const voucherDiscount = (voucher?.value || 0) / numEligible
        const finalPrice = original - voucherDiscount
        return {
          ...item,
          finalPrice,
          priceAfterPromotion: original,
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
        const newPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)
        const voucherDiscount = original - newPrice
        return {
          ...item,
          finalPrice: newPrice,
          priceAfterPromotion: original,
          promotionDiscount: 0,
          voucherDiscount,
        }
      }
    }

    // Mặc định: item không hợp lệ (không trong danh sách, hoặc không nằm trong rule)
    return {
      ...item,
      finalPrice: priceAfterPromotion,
      priceAfterPromotion,
      promotionDiscount,
      voucherDiscount: 0,
    }
  })
}

export function calculateOrderItemDisplay(
  orderItems: IOrderDetail[],
  voucher: IVoucher | null,
): IDisplayOrderItem[] {
  if (!orderItems || orderItems.length === 0) return []

  const voucherProductSlugs =
    voucher?.voucherProducts?.map((vp) => vp.product?.slug ?? '') || []

  const rule = voucher?.applicabilityRule
  const type = voucher?.type
  const isVoucherValid = voucher
    ? isVoucherApplicableFromOrderDetails(orderItems, voucher)
    : false

  const inVoucherList = (item: IOrderDetail) => {
    const slug = item?.variant?.product?.slug ?? ''
    return voucherProductSlugs.includes(slug)
  }

  const eligibleItems = voucher ? orderItems.filter(inVoucherList) : []

  return orderItems.map((item) => {
    const original = item.variant?.price ?? 0
    const productSlug = item?.variant?.product?.slug ?? ''
    const name = item.variant?.product?.name ?? ''

    // ===== TÍNH PROMOTION =====
    let promotionDiscount = 0
    if (item.promotion?.type === 'per-product') {
      const promotionValue = item.promotion?.value || 0
      promotionDiscount = Math.round(original * (promotionValue / 100))
    }

    const priceAfterPromotion = Math.max(0, original - promotionDiscount)
    const isEligible = inVoucherList(item)

    // ===== DEFAULT GIÁ TRỊ KẾT QUẢ =====
    let finalPrice = priceAfterPromotion
    let voucherDiscount = 0

    if (!isVoucherValid) {
      return {
        ...item,
        name,
        productSlug,
        originalPrice: original,
        finalPrice,
        priceAfterPromotion,
        promotionDiscount,
        voucherDiscount,
      }
    }

    // ===== RULE: ALL_REQUIRED =====
    if (rule === APPLICABILITY_RULE.ALL_REQUIRED) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        voucherDiscount = (voucher?.value || 0 * original) / 100
        const finalPrice = original - original * voucherDiscount
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const perItemDiscount = voucher?.value || 0 / orderItems.length
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice: priceAfterPromotion,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount: perItemDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT && isEligible) {
        const voucherPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)
        finalPrice = voucherPrice
        voucherDiscount = priceAfterPromotion - voucherPrice
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion,
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      // Trường hợp item không thuộc danh sách áp dụng
      return {
        ...item,
        name,
        productSlug,
        originalPrice: original,
        finalPrice: priceAfterPromotion,
        priceAfterPromotion,
        promotionDiscount,
        voucherDiscount: 0,
      }
    }

    // ===== RULE: AT_LEAST_ONE_REQUIRED =====
    if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED && isEligible) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        voucherDiscount = (voucher?.value || 0 * original) / 100
        const finalPrice = original - original * voucherDiscount
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion: original, // Bỏ promotion
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const perItemDiscount =
          (voucher?.value || 0) / (eligibleItems.length || 1)
        finalPrice = original - perItemDiscount
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion: original, // Bỏ promotion
          promotionDiscount: 0,
          voucherDiscount: perItemDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
        const voucherPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)
        finalPrice = voucherPrice
        voucherDiscount = original - voucherPrice
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion: original, // Bỏ promotion
          promotionDiscount: 0,
          voucherDiscount,
        }
      }
    }

    // ===== DEFAULT: không hợp lệ hoặc không được áp dụng =====
    return {
      ...item,
      name,
      productSlug,
      originalPrice: original,
      finalPrice: priceAfterPromotion,
      priceAfterPromotion,
      promotionDiscount,
      voucherDiscount: 0,
    }
  })
}

export function calculateCartTotals(
  displayItems: IDisplayCartItem[],
  voucher: IVoucher | null,
) {
  // console.log('Calculating cart totals for display items:', displayItems)
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
      // Tổng giảm giá từ các item đã áp dụng giá đặc biệt
      voucherDiscount = _.sumBy(displayItems, (item) => {
        if (allowedProductSlugs.includes(item.slug)) {
          return (item.voucherDiscount || 0) * (item.quantity || 0)
        }
        return 0
      })
    } else if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
      const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
      voucherDiscount = Math.round(
        ((voucher.value || 0) * totalAfterPromo) / 100,
      )
    } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      voucherDiscount = Math.min(
        voucher.value || 0,
        subTotalBeforeDiscount - promotionDiscount,
      )
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
      const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
      voucherDiscount = Math.round((voucher.value * totalAfterPromo) / 100)
    } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
      voucherDiscount = Math.min(voucher.value || 0, totalAfterPromo)
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
