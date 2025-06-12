import moment from 'moment'
import _ from 'lodash'

import { useCartItemStore } from '@/stores'
import { VOUCHER_TYPE } from '@/constants'
import {
  ICartItem,
  IDisplayCartItem,
  IOrderDetail,
  IVoucher,
  IVoucherInCart,
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

export function calculateCartTotals(
  displayItems: IDisplayCartItem[],
  voucher: IVoucherInCart | null,
) {
  if (!voucher) {
    return {
      subTotalBeforeDiscount: _.sumBy(
        displayItems,
        (item) => (item.originalPrice || 0) * item.quantity,
      ),
      promotionDiscount: _.sumBy(
        displayItems,
        (item) => (item.promotionDiscount || 0) * item.quantity,
      ),
      voucherDiscount: 0,
      finalTotal: _.sumBy(
        displayItems,
        (item) => (item.priceAfterPromotion || 0) * item.quantity,
      ),
    }
  }

  const subTotalBeforeDiscount = _.sumBy(
    displayItems,
    (item) => (item.originalPrice || 0) * item.quantity,
  )

  const promotionDiscount = _.sumBy(
    displayItems,
    (item) => (item.promotionDiscount || 0) * item.quantity,
  )
  // console.log('promotionDiscount', promotionDiscount)
  let voucherDiscount = 0
  if (voucher?.type === VOUCHER_TYPE.PERCENT_ORDER) {
    voucherDiscount =
      (voucher.value * (subTotalBeforeDiscount - promotionDiscount)) / 100
  } else if (voucher?.type === VOUCHER_TYPE.FIXED_VALUE) {
    voucherDiscount = voucher.value
  } else if (voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
    voucherDiscount = _.sumBy(
      displayItems,
      (item) =>
        (item.priceAfterPromotion || 0) -
        Math.min(item.priceAfterPromotion || 0, voucher.value || 0),
    )
  }

  // Nếu chưa có giảm từng item nhưng là FIXED_VALUE thì dùng cấp độ đơn hàng
  if (voucher?.type === VOUCHER_TYPE.FIXED_VALUE && voucherDiscount === 0) {
    voucherDiscount = voucher.value || 0
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

// export function calculateCartTotals(
//   displayItems: IDisplayCartItem[],
//   fixedOrderLevelDiscount: number = 0, // Truyền thêm nếu dùng FIXED_VALUE không phân bổ
// ): ICartCalculationResult {
//   const subTotalBeforeDiscount = _.sumBy(
//     displayItems,
//     (item) => (item.originalPrice || 0) * item.quantity,
//   )

//   const promotionDiscount = _.sumBy(
//     displayItems,
//     (item) => (item.promotionDiscount || 0) * item.quantity,
//   )

//   const itemLevelDiscount = _.sumBy(
//     displayItems,
//     (item) => (item.voucherDiscount || 0) * item.quantity,
//   )

//   const subTotalAfterPromotion = subTotalBeforeDiscount - promotionDiscount

//   const orderLevelDiscount = fixedOrderLevelDiscount // bổ sung giảm trực tiếp theo đơn

//   const totalDiscount =
//     promotionDiscount + itemLevelDiscount + orderLevelDiscount

//   const subTotal =
//     _.sumBy(displayItems, (item) => (item.finalPrice || 0) * item.quantity) -
//     orderLevelDiscount

//   return {
//     subTotalBeforeDiscount,
//     subTotalAfterPromotion,
//     subTotal,
//     promotionDiscount,
//     itemLevelDiscount,
//     orderLevelDiscount,
//     totalDiscount,
//   }
// }

export function calculateVoucherDiscountFromOrder(
  orderItems: IOrderDetail[],
  voucher?: IVoucher,
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
