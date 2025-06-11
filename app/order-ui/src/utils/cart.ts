import moment from 'moment'
import _ from 'lodash'

import { useCartItemStore } from '@/stores'
import { VOUCHER_TYPE } from '@/constants'
import { ICartCalculationResult, ICartItem } from '@/types'

interface AppliedCartResult {
  cart: ICartItem | null
  itemLevelDiscount: number
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

export function applyVoucherToCart(
  cartItems: ICartItem | null,
): AppliedCartResult {
  if (!cartItems || !cartItems.voucher) {
    return { cart: cartItems, itemLevelDiscount: 0 }
  }

  const { voucher } = cartItems
  const voucherProductSlugs = voucher.voucherProducts.map(
    (vp) => vp?.product?.slug,
  )
  let itemLevelDiscount = 0

  // Tính tổng tiền sau promotion để làm base cho order-level voucher
  const subTotalAfterPromotion = cartItems.orderItems.reduce((total, item) => {
    const original = item.originalPrice || item.price
    const afterPromotion = original - (item.promotionDiscount || 0)
    return total + afterPromotion * item.quantity
  }, 0)

  // Tính order-level discount trước
  let orderLevelDiscount = 0
  if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
    orderLevelDiscount = (subTotalAfterPromotion * (voucher.value || 0)) / 100
  } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
    orderLevelDiscount = voucher.value || 0
  }

  // Luôn tính toán lại voucher để đảm bảo cập nhật đúng khi orderItems thay đổi
  const updatedOrderItems = cartItems.orderItems.map((item) => {
    const original = item.originalPrice || item.price

    // Xử lý SAME_PRICE_PRODUCT voucher (item-level)
    const shouldApplyItemVoucher =
      voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
      voucherProductSlugs.includes(item.slug)

    if (shouldApplyItemVoucher) {
      let newPrice = 0

      // Nếu value <= 1 → phần trăm
      if (voucher.value <= 1) {
        newPrice = Math.round(original * (1 - voucher.value))
      } else {
        newPrice = Math.min(original, voucher.value)
      }

      const discountAmount = original - newPrice
      itemLevelDiscount += discountAmount * item.quantity

      return {
        ...item,
        price: newPrice,
        voucherDiscount: discountAmount,
        promotionDiscount: 0, // Bỏ promotion khi có voucher
        promotion: `same_price_${voucher.value}`,
      }
    }

    // Xử lý PERCENT_ORDER và FIXED_VALUE voucher (order-level)
    if (
      voucher.type === VOUCHER_TYPE.PERCENT_ORDER ||
      voucher.type === VOUCHER_TYPE.FIXED_VALUE
    ) {
      const promotionDiscount = item.promotionDiscount || 0

      const priceAfterPromotion = Math.max(0, original - promotionDiscount)

      // Phân bổ order-level discount theo tỷ lệ giá trị của từng item
      const itemRatio =
        subTotalAfterPromotion > 0
          ? (priceAfterPromotion * item.quantity) / subTotalAfterPromotion
          : 0
      const itemOrderDiscount = orderLevelDiscount * itemRatio
      const itemVoucherDiscount = itemOrderDiscount / item.quantity // Per unit

      const finalPrice = Math.max(0, priceAfterPromotion - itemVoucherDiscount)

      return {
        ...item,
        price: finalPrice,
        promotionDiscount,
        voucherDiscount: itemVoucherDiscount,
      }
    }

    // Không có voucher áp dụng → giữ promotion nếu có
    const promotionDiscount = item.promotionDiscount || 0
    const finalPrice = Math.max(0, original - promotionDiscount)

    return {
      ...item,
      price: finalPrice,
      promotionDiscount,
      voucherDiscount: 0, // Reset voucher discount cho items không áp dụng
    }
  })

  // Với order-level voucher, itemLevelDiscount = orderLevelDiscount
  if (
    voucher.type === VOUCHER_TYPE.PERCENT_ORDER ||
    voucher.type === VOUCHER_TYPE.FIXED_VALUE
  ) {
    itemLevelDiscount = orderLevelDiscount
  }

  return {
    cart: {
      ...cartItems,
      orderItems: updatedOrderItems,
    },
    itemLevelDiscount,
  }
}

export function calculateCartTotals(
  cartItems: ICartItem | null,
  itemLevelDiscount: number,
): ICartCalculationResult {
  const subTotalBeforeDiscount = _.sumBy(
    cartItems?.orderItems || [],
    (item) => (item.originalPrice || item.price) * item.quantity,
  )

  // Tổng giảm giá đến từ promotion
  const promotionDiscount = _.sumBy(
    cartItems?.orderItems || [],
    (item) => (item.promotionDiscount || 0) * item.quantity,
  )

  // Tổng tiền sau promotion nhưng TRƯỚC voucher (để tính % order voucher)
  const subTotalAfterPromotion = _.sumBy(
    cartItems?.orderItems || [],
    (item) => {
      const original = item.originalPrice || item.price
      const afterPromotion = original - (item.promotionDiscount || 0)
      return afterPromotion * item.quantity
    },
  )

  const voucher = cartItems?.voucher
  let orderLevelDiscount = 0

  if (voucher) {
    if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
      // Tính % trên tổng sau promotion, trước voucher item-level
      orderLevelDiscount = (subTotalAfterPromotion * (voucher.value || 0)) / 100
    } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      orderLevelDiscount = voucher.value || 0
    }
    // SAME_PRICE_PRODUCT đã được tính ở itemLevelDiscount
  }

  // subTotal cuối cùng sau tất cả discount
  const subTotal = _.sumBy(
    cartItems?.orderItems || [],
    (item) => item.price * item.quantity,
  )
  // console.log(
  //   '🔍 [calculateCartTotals] subTotal:',
  //   subTotal,
  //   'orderLevelDiscount:',
  //   orderLevelDiscount,
  // )

  const totalDiscount = promotionDiscount + orderLevelDiscount
  // const totalAfterDiscount = subTotalBeforeDiscount - orderLevelDiscount

  return {
    subTotalBeforeDiscount,
    subTotal,
    subTotalAfterPromotion,
    promotionDiscount,
    itemLevelDiscount,
    orderLevelDiscount,
    totalDiscount,
    // totalAfterDiscount,
  }
}
