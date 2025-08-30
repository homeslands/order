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
  defaultValue?: string
  onSubmit?: (paymentMethod: PaymentMethod) => void
}
export default function PaymentMethodRadioGroup({
  order,
  defaultValue,
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

    return methods
  }, [userInfo])

  // Get supported payment methods from voucher
  const getSupportedPaymentMethods = useCallback(() => {
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return getAvailablePaymentMethods()
    }

    return voucherPaymentMethods.map(vpm => {
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
  }, [order?.voucher, voucherPaymentMethods, getAvailablePaymentMethods])

  // Check if payment method is supported by voucher
  const isPaymentMethodSupported = (paymentMethod: PaymentMethod) => {
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return true // No voucher means all methods are supported
    }

    const supportedMethods = getSupportedPaymentMethods()
    return supportedMethods.includes(paymentMethod)
  }

  // Check if there's any compatible payment method between voucher and user role
  const hasCompatiblePaymentMethod = useMemo(() => {
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      return true // No voucher means all methods are compatible
    }

    const availableMethods = getAvailablePaymentMethods()
    const supportedMethods = getSupportedPaymentMethods()
    return supportedMethods.some(method => availableMethods.includes(method))
  }, [order?.voucher, voucherPaymentMethods, getAvailablePaymentMethods, getSupportedPaymentMethods])

  // Randomly select a payment method based on conditions
  const getRandomDefaultPaymentMethod = useCallback(() => {
    if (!order?.voucher || voucherPaymentMethods.length === 0) {
      // No voucher: random from all available methods
      const availableMethods = getAvailablePaymentMethods()
      return availableMethods[Math.floor(Math.random() * availableMethods.length)]
    } else {
      // Has voucher: random from supported methods that are also available for user role
      const availableMethods = getAvailablePaymentMethods()
      const supportedMethods = getSupportedPaymentMethods()
      const compatibleMethods = supportedMethods.filter(method => availableMethods.includes(method))

      if (compatibleMethods.length === 0) {
        // No compatible methods - fallback to first available method for user role
        return availableMethods[0]
      }

      return compatibleMethods[Math.floor(Math.random() * compatibleMethods.length)]
    }
  }, [order?.voucher, voucherPaymentMethods, getAvailablePaymentMethods, getSupportedPaymentMethods])

  // Initialize payment method when defaultValue changes
  useEffect(() => {
    if (defaultValue && defaultValue !== selectedPaymentMethod) {
      // Update when defaultValue changes and is different from current selection
      setSelectedPaymentMethod(defaultValue)
    }
  }, [defaultValue, selectedPaymentMethod])

  // Initialize with random method if no defaultValue
  useEffect(() => {
    if (!defaultValue && !selectedPaymentMethod) {
      const randomMethod = getRandomDefaultPaymentMethod()
      setSelectedPaymentMethod(randomMethod)
      if (onSubmit) {
        onSubmit(randomMethod)
      }
    }
  }, [defaultValue, selectedPaymentMethod, getRandomDefaultPaymentMethod, onSubmit])

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
          value={selectedPaymentMethod || defaultValue || PaymentMethod.BANK_TRANSFER}
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
                <div className={`flex items-center gap-1 pl-2 ${isPaymentMethodSupported(PaymentMethod.POINT)
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
                  }`}>
                  <Label htmlFor="r4" className={`flex items-center gap-1 ${!isPaymentMethodSupported(PaymentMethod.POINT) ? 'opacity-50' : ''
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
                <span className={`flex items-center gap-1 text-xs font-medium ${isPaymentMethodSupported(PaymentMethod.POINT)
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
      value={selectedPaymentMethod || defaultValue || PaymentMethod.BANK_TRANSFER}
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
            <div className={`flex items-center gap-1 pl-2 ${isPaymentMethodSupported(PaymentMethod.POINT)
              ? 'text-muted-foreground'
              : 'text-muted-foreground/50'
              }`}>
              <Label htmlFor="r4" className={`flex items-center gap-1 ${!isPaymentMethodSupported(PaymentMethod.POINT) ? 'opacity-50' : ''
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
            <span className={`flex items-center gap-1 text-xs font-medium ${isPaymentMethodSupported(PaymentMethod.POINT)
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
