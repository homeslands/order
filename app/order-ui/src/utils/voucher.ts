import { APPLICABILITY_RULE } from "@/constants"

export   function isVoucherApplicableToCartItems(
    cartProductSlugs: string[],
    voucherProductSlugs: string[],
    rule: APPLICABILITY_RULE
  ): boolean {
    if (voucherProductSlugs.length === 0 || cartProductSlugs.length === 0) return false

    if (rule === APPLICABILITY_RULE.ALL_REQUIRED) {
      // ✅ Tất cả sản phẩm trong giỏ hàng phải nằm trong danh sách voucher
      return cartProductSlugs.every((slug) => voucherProductSlugs.includes(slug))
    }

    if (rule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED) {
      // ✅ Chỉ cần ít nhất một món trong giỏ nằm trong danh sách voucher
      return cartProductSlugs.some((slug) => voucherProductSlugs.includes(slug))
    }

    return false
  }