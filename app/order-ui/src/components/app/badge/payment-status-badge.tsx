import { useTranslation } from 'react-i18next'

import { paymentStatus } from '@/constants'

interface IPaymentStatusBadgeProps {
  status: paymentStatus
}

export default function PaymentStatusBadge({
  status,
}: IPaymentStatusBadgeProps) {
  const { t } = useTranslation(['menu'])

  const getBadgeColor = (status: paymentStatus) => {
    switch (status) {
      case paymentStatus.PENDING:
        return 'bg-yellow-400 text-white'
      case paymentStatus.COMPLETED:
        return 'bg-emerald-500 text-white'
      case paymentStatus.CANCELLED:
        return 'bg-destructive text-white'
    }
  }

  const getBadgeText = (status: paymentStatus) => {
    switch (status) {
      case paymentStatus.PENDING:
        return t('paymentMethod.pending')
      case paymentStatus.COMPLETED:
        return t('paymentMethod.paid')
      case paymentStatus.CANCELLED:
        return t('paymentMethod.failed')
    }
  }
  // Ensure the component returns valid JSX
  return (
    <span
      className={`inline-block min-w-fit w-[80%] rounded-full px-2 py-1 text-center text-xs ${getBadgeColor(
        status || paymentStatus.PENDING,
      )}`}
    >
      {getBadgeText(status || paymentStatus.PENDING)}
    </span>
  )
}
