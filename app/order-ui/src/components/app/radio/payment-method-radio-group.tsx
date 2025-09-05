import { Coins, CreditCard, CircleDollarSign, CoinsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useCallback, useMemo } from 'react'

import { RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { PaymentMethod, Role, VOUCHER_PAYMENT_METHOD } from '@/constants'
import { useUserStore } from '@/stores'
import { useGetUserBalance } from '@/hooks'
import { formatCurrency } from '@/utils'
import { IOrder } from '@/types'

interface PaymentMethodRadioGroupProps {
  order?: IOrder
  defaultValue: string | null
  disabledMethods?: PaymentMethod[]
  disabledReasons?: Record<PaymentMethod, string>
  onSubmit?: (paymentMethod: PaymentMethod) => void
}
export default function PaymentMethodRadioGroup({
  order,
  defaultValue,
  disabledMethods,
  disabledReasons,
  onSubmit,
}: PaymentMethodRadioGroupProps) {
  const { t } = useTranslation('menu')
  const { t: tProfile } = useTranslation('profile')
  const { userInfo } = useUserStore()

  const { data: balanceData } = useGetUserBalance(
    userInfo?.slug,
    !!userInfo?.slug,
  )
  const balance = balanceData?.result?.points || 0
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')

  const voucherPaymentMethods = useMemo(() =>
    order?.voucher?.voucherPaymentMethods || [],
    [order?.voucher?.voucherPaymentMethods]
  )

  // Get all available payment methods based on user role
  const getAvailablePaymentMethods = useCallback(() => {
    const methods = [PaymentMethod.BANK_TRANSFER]

    if (userInfo && userInfo.role.name !== Role.CUSTOMER) {
      methods.push(PaymentMethod.CASH)
    }

    if (userInfo && userInfo.role.name === Role.CUSTOMER) {
      methods.push(PaymentMethod.POINT)
    }

    // Filter out disabled methods
    if (disabledMethods) {
      return methods.filter(method => !disabledMethods.includes(method))
    }

    return methods
  }, [userInfo, disabledMethods])

  // Get supported payment methods from voucher
  const getSupportedPaymentMethods = useCallback(() => {
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return getAvailablePaymentMethods()
    }

    const supportedMethods = voucherPaymentMethods.map(vpm => {
      // Map voucher payment methods to PaymentMethod enum
      switch (vpm.paymentMethod) {
        case VOUCHER_PAYMENT_METHOD.CASH:
          return PaymentMethod.CASH
        case VOUCHER_PAYMENT_METHOD.BANK_TRANSFER:
          return PaymentMethod.BANK_TRANSFER
        case VOUCHER_PAYMENT_METHOD.POINT:
          return PaymentMethod.POINT
        default:
          return PaymentMethod.BANK_TRANSFER
      }
    })

    // Filter out disabled methods
    if (disabledMethods) {
      return supportedMethods.filter(method => !disabledMethods.includes(method))
    }

    return supportedMethods
  }, [order?.voucher, voucherPaymentMethods, getAvailablePaymentMethods, disabledMethods])

  // Check if payment method is supported by voucher and role
  const isPaymentMethodSupported = (paymentMethod: PaymentMethod) => {
    // Nếu method nằm trong danh sách disabled thì không hỗ trợ
    if (disabledMethods?.includes(paymentMethod)) {
      return false
    }

    // Lấy danh sách method theo role
    const availableMethods = getAvailablePaymentMethods()
    if (!availableMethods.includes(paymentMethod)) {
      return false
    }

    // Nếu không có voucher hoặc voucher không giới hạn phương thức thì chỉ check theo role
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return true
    }

    // Nếu có voucher, kiểm tra method có trong danh sách voucher hỗ trợ không
    return voucherPaymentMethods.some(vpm => {
      switch (paymentMethod) {
        case PaymentMethod.CASH:
          return vpm.paymentMethod === 'cash'
        case PaymentMethod.BANK_TRANSFER:
          return vpm.paymentMethod === 'bank-transfer'
        case PaymentMethod.POINT:
          return vpm.paymentMethod === 'point'
        default:
          return false
      }
    })
  }

  // Check if there's any compatible payment method between voucher and user role
  const hasCompatiblePaymentMethod = useMemo(() => {
    const availableMethods = getAvailablePaymentMethods()

    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return availableMethods.length > 0 // Has at least one available method
    }

    const supportedMethods = getSupportedPaymentMethods()
    return supportedMethods.some(method => availableMethods.includes(method))
  }, [order?.voucher, voucherPaymentMethods, getAvailablePaymentMethods, getSupportedPaymentMethods])

  // Initialize payment method when defaultValue changes or when voucher payment methods change
  // Chỉ set selectedPaymentMethod khi component mount hoặc khi voucher thay đổi
  useEffect(() => {
    if (defaultValue) {
      setSelectedPaymentMethod(defaultValue)
    }
  }, [defaultValue, voucherPaymentMethods.length])

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod)
    if (onSubmit) {
      onSubmit(paymentMethod)
    }
  }

  // Show warning when no compatible methods exist
  if (!hasCompatiblePaymentMethod) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
          <div className="flex gap-2 items-center text-orange-800">
            <span className="text-sm font-medium">⚠️ Voucher không tương thích với phương thức thanh toán hiện có</span>
          </div>
          <p className="mt-1 text-xs text-orange-600">
            {t('paymentMethod.voucherNotCompatible')} {voucherPaymentMethods.map(vpm => {
              switch (vpm.paymentMethod) {
                case 'cash': return t('paymentMethod.cash')
                case 'bank-transfer': return t('paymentMethod.bankTransfer')
                case 'point': return t('paymentMethod.coin')
                default: return vpm.paymentMethod
              }
            }).join(', ')}, {t('paymentMethod.butYouCanUse')} {getAvailablePaymentMethods().map(method => {
              switch (method) {
                case PaymentMethod.CASH: return t('paymentMethod.cash')
                case PaymentMethod.BANK_TRANSFER: return t('paymentMethod.bankTransfer')
                case PaymentMethod.POINT: return t('paymentMethod.coin')
                default: return method
              }
            }).join(', ')}
          </p>
        </div>
        <RadioGroup
          value={selectedPaymentMethod || defaultValue || ''}
          className="gap-6 min-w-full"
          onValueChange={handlePaymentMethodChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="r2" />
            <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER)
              ? 'text-muted-foreground'
              : 'text-muted-foreground/50'
              }`}>
              <Label htmlFor="r2" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER) ? 'opacity-50' : ''
                }`}>
                <CreditCard size={20} />
                {t('paymentMethod.bankTransfer')}
                {!isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER) && (
                  <span className="ml-1 text-xs text-orange-500">
                    ({disabledReasons?.[PaymentMethod.BANK_TRANSFER] || t('paymentMethod.voucherNotSupport')})
                  </span>
                )}
              </Label>
            </div>
          </div>
          {userInfo && userInfo.role.name !== Role.CUSTOMER && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PaymentMethod.CASH} id="r3" />
              <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.CASH)
                ? 'text-muted-foreground'
                : 'text-muted-foreground/50'
                }`}>
                <Label htmlFor="r3" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.CASH) ? 'opacity-50' : ''
                  }`}>
                  <Coins size={20} />
                  {t('paymentMethod.cash')}
                  {!isPaymentMethodSupported(PaymentMethod.CASH) && (
                    <span className="ml-1 text-xs text-orange-500">
                      ({disabledReasons?.[PaymentMethod.CASH] || t('paymentMethod.voucherNotSupport')})
                    </span>
                  )}
                </Label>
              </div>
            </div>
          )}
          {userInfo && userInfo.role.name == Role.CUSTOMER && (
            <div className="flex space-x-2">
              <RadioGroupItem
                value={PaymentMethod.POINT}
                id="r4"
                className="mt-[2px]"
              />
              <div className="flex flex-col space-x-2">
                <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.POINT)
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
                  }`}>
                  <Label htmlFor="r4" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.POINT) ? 'opacity-50' : ''
                    }`}>
                    <CircleDollarSign size={20} />
                    <span className="flex flex-col">
                      <span>{t('paymentMethod.coin')}</span>
                      {!isPaymentMethodSupported(PaymentMethod.POINT) && (
                        <span className="text-xs text-orange-500">
                          ({disabledReasons?.[PaymentMethod.POINT] || t('paymentMethod.voucherNotSupport')})
                        </span>
                      )}
                    </span>
                  </Label>
                </div>
                <span className={`flex gap-1 items-center text-xs font-medium ${isPaymentMethodSupported(PaymentMethod.POINT)
                  ? 'text-primary'
                  : 'text-primary/50'
                  }`}>
                  {tProfile('profile.coinBalance')}: {formatCurrency(balance, '')}
                  <CoinsIcon className="w-4 h-4" />
                </span>
              </div>
            </div>
          )}
        </RadioGroup>
      </div>
    )
  }

  return (
    <RadioGroup
      value={selectedPaymentMethod || defaultValue || ''}
      className="gap-6 min-w-full"
      onValueChange={handlePaymentMethodChange}
    >
      {/* <div className="flex items-center space-x-2">
        <RadioGroupItem value="internalWallet" id="r1" />
        <div className="flex gap-1 items-center pl-2 text-muted-foreground">
          <Label htmlFor="r1" className="flex gap-1 items-center">
            <WalletMinimal size={20} />
            {t('paymentMethod.internalWallet')} (coming soon)
          </Label>
        </div>
      </div> */}
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="r2" />
        <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER)
          ? 'text-muted-foreground'
          : 'text-muted-foreground/50'
          }`}>
          <Label htmlFor="r2" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER) ? 'opacity-50' : ''
            }`}>
            <CreditCard size={20} />
            {t('paymentMethod.bankTransfer')}
            {!isPaymentMethodSupported(PaymentMethod.BANK_TRANSFER) && (
              <span className="ml-1 text-xs text-orange-500">({t('paymentMethod.voucherNotSupport')})</span>
            )}
          </Label>
        </div>
      </div>
      {userInfo && userInfo.role.name !== Role.CUSTOMER && (
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={PaymentMethod.CASH} id="r3" />
          <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.CASH)
            ? 'text-muted-foreground'
            : 'text-muted-foreground/50'
            }`}>
            <Label htmlFor="r3" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.CASH) ? 'opacity-50' : ''
              }`}>
              <Coins size={20} />
              {t('paymentMethod.cash')}
              {!isPaymentMethodSupported(PaymentMethod.CASH) && (
                <span className="ml-1 text-xs text-orange-500">({t('paymentMethod.voucherNotSupport')})</span>
              )}
            </Label>
          </div>
        </div>
      )}
      {userInfo && userInfo.role.name == Role.CUSTOMER && (
        <div className="flex space-x-2">
          <RadioGroupItem
            value={PaymentMethod.POINT}
            id="r4"
            className="mt-[2px]"
          />
          <div className="flex flex-col space-x-2">
            <div className={`flex gap-1 items-center pl-2 ${isPaymentMethodSupported(PaymentMethod.POINT)
              ? 'text-muted-foreground'
              : 'text-muted-foreground/50'
              }`}>
              <Label htmlFor="r4" className={`flex gap-1 items-center ${!isPaymentMethodSupported(PaymentMethod.POINT) ? 'opacity-50' : ''
                }`}>
                <CircleDollarSign size={20} />
                <span className="flex flex-col">
                  <span>{t('paymentMethod.coin')}</span>
                  {!isPaymentMethodSupported(PaymentMethod.POINT) && (
                    <span className="text-xs text-orange-500">({t('paymentMethod.voucherNotSupport')})</span>
                  )}
                </span>
              </Label>
            </div>
            <span className={`flex gap-1 items-center text-xs font-medium ${isPaymentMethodSupported(PaymentMethod.POINT)
              ? 'text-primary'
              : 'text-primary/50'
              }`}>
              {tProfile('profile.coinBalance')}: {formatCurrency(balance, '')}
              <CoinsIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      )}
    </RadioGroup>
  )
}
