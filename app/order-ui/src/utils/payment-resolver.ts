import { PaymentMethod, Role } from '@/constants'
import { IOrder } from '@/types'

interface PaymentResolution {
  effectiveMethods: PaymentMethod[]
  defaultMethod: PaymentMethod | null
  disabledMethods: PaymentMethod[]
  reasonMap: Record<PaymentMethod, string>
  payButtonEnabled: boolean
  bannerMessage?: string
}

/** role → methods khả dụng */
export function getAvailableMethodsByRole(role: Role | undefined | null): PaymentMethod[] {
  switch (role) {
    case Role.CUSTOMER:
      return [PaymentMethod.BANK_TRANSFER, PaymentMethod.POINT]
    case Role.STAFF:
      return [PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH]
    case Role.ADMIN:
      return [PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH]
    default:
      // Default cho user không login - chỉ có bank transfer
      return [PaymentMethod.BANK_TRANSFER]
  }
}

export const paymentResolver = (
  order: IOrder | null,
  availableMethods: PaymentMethod[],
): Omit<PaymentResolution, 'defaultMethod'> & {
  suggestedDefault: PaymentMethod | null
} => {
  const voucherMethods =
    order?.voucher?.voucherPaymentMethods.map((v) => v.paymentMethod) ?? []

  const effectiveMethods =
    voucherMethods.length > 0
      ? voucherMethods.filter((m) =>
          availableMethods.includes(m as PaymentMethod),
        )
      : availableMethods

  // chỉ trả về "suggestion", không ép buộc
  let suggestedDefault: PaymentMethod | null = null
  if (voucherMethods.length > 0 && effectiveMethods.length > 0) {
    suggestedDefault = effectiveMethods[0] as PaymentMethod
  } else if (voucherMethods.length === 0 && availableMethods.length > 0) {
    suggestedDefault = availableMethods[0]
  }

  const payButtonEnabled = effectiveMethods.length > 0

  const reasonMap: Record<PaymentMethod, string> = {
    [PaymentMethod.BANK_TRANSFER]: '',
    [PaymentMethod.CASH]: '',
    [PaymentMethod.POINT]: '',
  }

  if (voucherMethods.length) {
    for (const m of availableMethods) {
      if (!voucherMethods.includes(m)) {
        reasonMap[m] = 'Không nằm trong phương thức mà voucher hỗ trợ.'
      }
    }
  }

  for (const m of voucherMethods) {
    if (!availableMethods.includes(m as PaymentMethod)) {
      reasonMap[m as PaymentMethod] =
        m === PaymentMethod.CASH
          ? 'Voucher này chỉ áp dụng cho tiền mặt. Vui lòng đến quầy.'
          : 'Phương thức này không khả dụng.'
    }
  }

  const disabledMethods = Object.entries(reasonMap)
    .filter(([_, reason]) => reason !== '')
    .map(([method]) => method as PaymentMethod)

  let bannerMessage: string | undefined
  if (effectiveMethods.length === 0 && voucherMethods.length > 0) {
    bannerMessage =
      'Không có phương thức thanh toán hợp lệ. Vui lòng gỡ voucher hoặc đến quầy.'
  }

  return {
    effectiveMethods: effectiveMethods as PaymentMethod[],
    suggestedDefault,
    disabledMethods,
    reasonMap,
    payButtonEnabled,
    bannerMessage,
  }
}

/** Hook tổng */
