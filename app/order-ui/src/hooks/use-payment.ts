import { useMemo } from 'react'

import { PaymentMethod, Role } from '@/constants'
import { IOrder } from '@/types'
import { getAvailableMethodsByRole, paymentResolver } from '@/utils'

export function usePaymentResolver(
  order: IOrder | null,
  role: Role,
  userSelectedMethod?: PaymentMethod | null,
) {
  return useMemo(() => {
    const availableMethods = getAvailableMethodsByRole(role)
    const result = paymentResolver(order || null, availableMethods)

    let defaultMethod: PaymentMethod | null = null
    if (
      userSelectedMethod &&
      result.effectiveMethods.includes(userSelectedMethod)
    ) {
      // Nếu có userSelectedMethod và nó hợp lệ, ưu tiên dùng nó
      defaultMethod = userSelectedMethod
    } else if (result.effectiveMethods.length > 0) {
      // Nếu không có userSelectedMethod, dùng phương thức đầu tiên trong effectiveMethods
      defaultMethod = result.effectiveMethods[0]
    } else {
      // Fallback về suggestedDefault nếu không có phương thức nào khả dụng
      defaultMethod = result.suggestedDefault
    }

    return { ...result, defaultMethod }
  }, [order, role, userSelectedMethod])
}
