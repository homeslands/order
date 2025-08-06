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
  if (!cartItems?.orderItems || cartItems.orderItems.length === 0) {
    return false // Không có sản phẩm → không áp dụng
  }

  // Lấy slug sản phẩm trong giỏ
  const cartSlugs = cartItems.orderItems.map((item) => item.slug ?? '')

  // Lấy slug sản phẩm mà voucher áp dụng
  const requiredSlugs =
    voucher.voucherProducts?.map((vp) => vp.product?.slug ?? '') || []

  // Nếu voucher không giới hạn sản phẩm nào → áp dụng cho tất cả
  if (requiredSlugs.length === 0) {
    return checkMinOrderValue(cartItems, voucher)
  }

  // Kiểm tra theo rule
  if (voucher.applicabilityRule === APPLICABILITY_RULE.ALL_REQUIRED) {
    // Tất cả sản phẩm trong giỏ phải nằm trong voucherProducts
    const allInVoucher = cartSlugs.every((slug) => requiredSlugs.includes(slug))
    if (!allInVoucher) return false
  }

  if (voucher.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
    // Ít nhất một sản phẩm trong giỏ nằm trong voucherProducts
    const hasAtLeastOne = cartSlugs.some((slug) => requiredSlugs.includes(slug))
    if (!hasAtLeastOne) return false
  }

  // Cuối cùng, check minOrderValue nếu có
  return checkMinOrderValue(cartItems, voucher)
}

function checkMinOrderValue(cartItems: ICartItem, voucher: IVoucher): boolean {
  if (!voucher.minOrderValue || voucher.minOrderValue <= 0) return true

  // Tổng tiền GỐC (đã trừ promotion, chưa trừ voucher)
  const subtotalBeforeVoucher = cartItems.orderItems.reduce((acc, item) => {
    const original = item.originalPrice ?? 0
    const promotionDiscount = item.promotionDiscount ?? 0
    return acc + (original - promotionDiscount) * item.quantity
  }, 0)

  return subtotalBeforeVoucher >= voucher.minOrderValue
}

function isVoucherApplicableFromOrderDetails(
  orderItems: IOrderDetail[],
  voucher: IVoucher,
): boolean {
  if (!orderItems || orderItems.length === 0) return false

  const cartSlugs = orderItems.map((item) => item.variant?.product?.slug ?? '')
  const requiredSlugs =
    voucher.voucherProducts?.map((vp) => vp.product?.slug ?? '') || []

  // Nếu voucher áp dụng cho tất cả sản phẩm
  if (requiredSlugs.length === 0) {
    return true
  }

  if (voucher.applicabilityRule === APPLICABILITY_RULE.ALL_REQUIRED) {
    // Tất cả sản phẩm trong giỏ phải nằm trong voucherProducts
    const allInVoucher = cartSlugs.every((slug) => requiredSlugs.includes(slug))
    return allInVoucher
  }

  if (voucher.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
    // Ít nhất một sản phẩm trong giỏ nằm trong voucherProducts
    const hasAtLeastOne = cartSlugs.some((slug) => requiredSlugs.includes(slug))
    return hasAtLeastOne
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

    // Giảm từ promotion (nếu có)
    const promotionDiscount =
      item.promotionDiscount ??
      Math.round(original * ((item.promotionValue || 0) / 100))

    const priceAfterPromotion = Math.max(0, original - promotionDiscount)
    const isEligible = inVoucherList(item)

    // ===== Không có hoặc voucher không hợp lệ =====
    if (!isVoucherValid || !voucher) {
      return {
        ...item,
        finalPrice: priceAfterPromotion,
        priceAfterPromotion,
        promotionDiscount,
        voucherDiscount: 0,
      }
    }

    // ===== RULE: ALL_REQUIRED =====
    if (rule === APPLICABILITY_RULE.ALL_REQUIRED) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        const voucherDiscount = Math.round(
          ((voucher.value || 0) / 100) * priceAfterPromotion,
        )
        const finalPrice = Math.max(0, priceAfterPromotion - voucherDiscount)
        return {
          ...item,
          finalPrice,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const numEligible = eligibleItems.length || 1
        const voucherDiscount = Math.min(
          original,
          (voucher.value || 0) / numEligible,
        )
        const finalPrice = Math.max(0, original - voucherDiscount)
        return {
          ...item,
          finalPrice,
          priceAfterPromotion: original,
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT && isEligible) {
        const newPrice =
          (voucher.value || 0) <= 1
            ? Math.round(original * (1 - (voucher.value || 0)))
            : Math.min(original, voucher.value || 0)
        const voucherDiscount = priceAfterPromotion - newPrice
        return {
          ...item,
          finalPrice: newPrice,
          priceAfterPromotion,
          promotionDiscount: 0,
          voucherDiscount,
        }
      }
    }

    // ===== RULE: AT_LEAST_ONE_REQUIRED (đã sửa logic) =====
    if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
      if (!isEligible) {
        return {
          ...item,
          finalPrice: priceAfterPromotion,
          priceAfterPromotion,
          promotionDiscount,
          voucherDiscount: 0,
        }
      }

      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        // Giảm % trực tiếp trên món hợp lệ
        const voucherDiscount = Math.round(
          ((voucher.value || 0) / 100) * original,
        )
        const finalPrice = Math.max(0, original - voucherDiscount)
        return {
          ...item,
          finalPrice,
          priceAfterPromotion: original, // bỏ promotion
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.FIXED_VALUE) {
        // Trừ thẳng full giá trị voucher vào từng món hợp lệ
        const voucherDiscount = Math.min(original, voucher.value || 0)
        const finalPrice = Math.max(0, original - voucherDiscount)
        return {
          ...item,
          finalPrice,
          priceAfterPromotion: original, // bỏ promotion
          promotionDiscount: 0,
          voucherDiscount,
        }
      }

      if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
        const newPrice =
          (voucher.value || 0) <= 1
            ? Math.round(original * (1 - (voucher.value || 0)))
            : Math.min(original, voucher.value || 0)
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

    // ===== Mặc định =====
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

  return orderItems.map((item) => {
    const original = item.variant?.price ?? 0
    const productSlug = item?.variant?.product?.slug ?? ''
    const name = item.variant?.product?.name ?? ''

    // ===== PROMOTION =====
    let promotionDiscount = 0
    if (item.promotion?.type === 'per-product') {
      const promotionValue = item.promotion?.value || 0
      promotionDiscount = Math.round(original * (promotionValue / 100))
    }

    const priceAfterPromotion = Math.max(0, original - promotionDiscount)
    const isEligible = inVoucherList(item)

    // Default
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
        voucherDiscount = Math.round(
          ((voucher?.value || 0) * priceAfterPromotion) / 100,
        )
        finalPrice = Math.max(0, priceAfterPromotion - voucherDiscount)
      } else if (type === VOUCHER_TYPE.FIXED_VALUE) {
        const perItemDiscount = (voucher?.value || 0) / orderItems.length
        voucherDiscount = Math.min(priceAfterPromotion, perItemDiscount)
        finalPrice = Math.max(0, priceAfterPromotion - voucherDiscount)
      } else if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT && isEligible) {
        const voucherPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)
        finalPrice = voucherPrice
        voucherDiscount = priceAfterPromotion - voucherPrice
        promotionDiscount = 0
      }

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

    // ===== RULE: AT_LEAST_ONE_REQUIRED =====
    if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
      if (type === VOUCHER_TYPE.PERCENT_ORDER) {
        if (isEligible) {
          // Giảm % trực tiếp vào giá gốc, bỏ promotion
          voucherDiscount = Math.round(((voucher?.value || 0) * original) / 100)
          finalPrice = Math.max(0, original - voucherDiscount)
          promotionDiscount = 0
          return {
            ...item,
            name,
            productSlug,
            originalPrice: original,
            finalPrice,
            priceAfterPromotion: original,
            promotionDiscount,
            voucherDiscount,
          }
        }
      } else if (type === VOUCHER_TYPE.FIXED_VALUE) {
        if (isEligible) {
          voucherDiscount = Math.min(original, voucher?.value || 0)
          finalPrice = Math.max(0, original - voucherDiscount)
          promotionDiscount = 0
          return {
            ...item,
            name,
            productSlug,
            originalPrice: original,
            finalPrice,
            priceAfterPromotion: original,
            promotionDiscount,
            voucherDiscount,
          }
        }
      } else if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT && isEligible) {
        const newPrice =
          (voucher?.value || 0) <= 1
            ? Math.round(original * (1 - (voucher?.value || 0)))
            : Math.min(original, voucher?.value || 0)
        voucherDiscount = original - newPrice
        finalPrice = newPrice
        promotionDiscount = 0
        return {
          ...item,
          name,
          productSlug,
          originalPrice: original,
          finalPrice,
          priceAfterPromotion: original,
          promotionDiscount,
          voucherDiscount,
        }
      }
    }

    // Không hợp lệ hoặc không match case trên → giữ nguyên
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
  const allowedProductSlugs =
    voucher?.voucherProducts?.map((vp) => vp.product?.slug) || []

  // Tổng giá gốc chưa giảm
  const subTotalBeforeDiscount = _.sumBy(
    displayItems,
    (item) => (item.originalPrice || 0) * (item.quantity || 0),
  )

  // Tổng giảm từ promotion (bỏ nếu item thuộc SAME_PRICE_PRODUCT + hợp lệ)
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

  // ===== Tổng giảm từ voucher =====
  let voucherDiscount = 0

  if (voucher) {
    const rule = voucher.applicabilityRule
    const type = voucher.type

    if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      // Cộng đúng voucherDiscount từng món hợp lệ
      voucherDiscount = _.sumBy(displayItems, (item) => {
        if (allowedProductSlugs.includes(item.slug)) {
          return (item.voucherDiscount || 0) * (item.quantity || 0)
        }
        return 0
      })
    } else if (type === VOUCHER_TYPE.PERCENT_ORDER) {
      // Với % order, cũng dùng voucherDiscount từ từng món (đã tính ở display)
      voucherDiscount = _.sumBy(displayItems, (item) => {
        return (item.voucherDiscount || 0) * (item.quantity || 0)
      })
    } else if (type === VOUCHER_TYPE.FIXED_VALUE) {
      if (rule === APPLICABILITY_RULE.ALL_REQUIRED) {
        // ALL_REQUIRED → áp cho toàn đơn, cap theo voucher.value
        const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
        voucherDiscount = Math.min(voucher.value || 0, totalAfterPromo)
      } else {
        // AT_LEAST_ONE_REQUIRED → cộng đúng theo item (không chia đều nữa)
        voucherDiscount = _.sumBy(displayItems, (item) => {
          return (item.voucherDiscount || 0) * (item.quantity || 0)
        })
      }
    }
  }

  // Tổng cuối
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
    (sum, item) => sum + (item.originalPrice || 0) * (item.quantity || 0),
    0,
  )

  const promotionDiscount = displayItems.reduce((sum, item) => {
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
  }, 0)

  let voucherDiscount = 0

  if (voucher) {
    const rule = voucher.applicabilityRule
    const type = voucher.type

    // ===== SAME_PRICE_PRODUCT =====
    if (type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      voucherDiscount = displayItems.reduce((sum, item) => {
        if (allowedProductSlugs.includes(item.productSlug)) {
          return sum + (item.voucherDiscount || 0) * (item.quantity || 0)
        }
        return sum
      }, 0)
    }

    // ===== PERCENT_ORDER =====
    else if (type === VOUCHER_TYPE.PERCENT_ORDER) {
      if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
        // Tính trực tiếp vào từng món hợp lệ, bỏ qua promotion
        voucherDiscount = displayItems.reduce((sum, item) => {
          if (allowedProductSlugs.includes(item.productSlug)) {
            const discount = Math.round(
              ((voucher.value || 0) * (item.originalPrice || 0)) / 100,
            )
            return sum + discount * (item.quantity || 0)
          }
          return sum
        }, 0)
      } else {
        // ALL_REQUIRED → tính cho toàn bộ sau promotion
        const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
        voucherDiscount = Math.round(
          ((voucher.value || 0) * totalAfterPromo) / 100,
        )
      }
    }

    // ===== FIXED_VALUE =====
    else if (type === VOUCHER_TYPE.FIXED_VALUE) {
      if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
        // Giảm full voucher.value cho từng món hợp lệ
        voucherDiscount = displayItems.reduce((sum, item) => {
          if (allowedProductSlugs.includes(item.productSlug)) {
            const discount = Math.min(
              item.originalPrice || 0,
              voucher.value || 0,
            )
            return sum + discount * (item.quantity || 0)
          }
          return sum
        }, 0)
      } else {
        // ALL_REQUIRED → áp cho toàn đơn sau promotion
        const totalAfterPromo = subTotalBeforeDiscount - promotionDiscount
        voucherDiscount = Math.min(voucher.value || 0, totalAfterPromo)
      }
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
