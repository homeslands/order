import { useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'

import { Button } from '@/components/ui'
import { useInitiatePayment, useOrderBySlug } from '@/hooks'
import { PaymentMethod, ROUTE } from '@/constants'
import { formatCurrency } from '@/utils'
import { ButtonLoading } from '@/components/app/loading'
import { ClientPaymentMethodSelect } from '@/components/app/select'
import { Label } from '@radix-ui/react-context-menu'
import { OrderStatus } from '@/types'
import { usePaymentMethodStore } from '@/stores'
import { Helmet } from 'react-helmet'
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import PaymentPageSkeleton from './skeleton/page'
import DownloadQrCode from '@/components/app/button/download-qr-code'

export function ClientPaymentPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('order')
  const navigate = useNavigate()
  const { data: order, isPending, refetch: refetchOrder } = useOrderBySlug(slug as string)
  const { mutate: initiatePayment, isPending: isPendingInitiatePayment } = useInitiatePayment()
  const { qrCode, setQrCode, paymentMethod, setPaymentMethod, paymentSlug, setPaymentSlug } = usePaymentMethodStore()
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại 

  // calculate original total
  const originalTotal = order?.result.orderItems ?
    order.result.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) : 0;

  const discount = order?.result.orderItems ?
    order.result.orderItems.reduce((sum, item) => sum + ((item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0)), 0) : 0;

  const voucherDiscount = order?.result.voucher ? (originalTotal - discount) * ((order.result.voucher.value) / 100) : 0;
  useEffect(() => {
    if (isExpired) {
      setIsPolling(false)
    }
  }, [isExpired])

  useEffect(() => {
    if (qrCode && paymentSlug && !isExpired) {
      setIsPolling(true)
    }
  }, [qrCode, paymentSlug, isExpired])

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const updatedOrder = await refetchOrder()
        if (updatedOrder.data?.result?.status === OrderStatus.PAID) {
          if (pollingInterval) clearInterval(pollingInterval)
          navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
        }
      }, 3000) // Poll every 3 seconds
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [isPolling, refetchOrder, navigate, slug])

  const handleSelectPaymentMethod = (selectedPaymentMethod: PaymentMethod) => {
    setPaymentMethod(selectedPaymentMethod)
    if (selectedPaymentMethod === PaymentMethod.BANK_TRANSFER && qrCode) setIsPolling(true)
    else setIsPolling(false) // Stop polling after selecting payment method
  }

  const handleConfirmPayment = () => {
    if (!slug || !paymentMethod) return
    setIsExpired(false)

    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      initiatePayment(
        { orderSlug: slug, paymentMethod },
        {
          onSuccess: (data) => {
            setPaymentSlug(data.result.slug)
            setQrCode(data.result.qrCode)
            setIsPolling(true)
          },
        },
      )
    } else if (paymentMethod === PaymentMethod.CASH) {
      initiatePayment(
        { orderSlug: slug, paymentMethod },
        {
          onSuccess: () => {
            navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
          },
        },
      )
    }
  }

  const handleExpire = useCallback((value: boolean) => {
    setIsExpired(value)
  }, [])

  if (isExpired) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <CircleX className="w-32 h-32 text-destructive" />
          <p className="text-center text-muted-foreground">
            {t('paymentMethod.timeExpired')}
          </p>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button variant="default">
              {t('order.backToMenu')}
            </Button>
          </NavLink>
        </div>
      </div>
    )
  }
  if (isPending) return <PaymentPageSkeleton />
  return (
    <div className="container py-10">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.payment.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.payment.title')} />
      </Helmet>
      <OrderCountdown createdAt={order?.result.createdAt || timeDefaultExpired} setIsExpired={handleExpire} />
      <span className="flex items-center justify-start w-full gap-1 text-lg">
        <SquareMenu />
        {t('menu.payment')}
        <span className="text-muted-foreground">#{slug}</span>
      </span>

      <div className="flex flex-col gap-3 mt-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Customer info */}
          <div className="w-full lg:w-1/3">
            <div className="flex flex-col gap-1 px-4 py-2 rounded-md bg-muted-foreground/10">
              <Label className="text-md">{t('paymentMethod.userInfo')}</Label>
            </div>
            <div className="flex flex-col gap-3 p-3 mt-2 border rounded">
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.customerName')}
                </h3>
                <p className="text-sm font-semibold">{`${order?.result.owner.lastName} ${order?.result.owner.firstName}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.orderDate')}
                </h3>
                <span className="text-sm font-semibold">
                  {moment(order?.result.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.phoneNumber')}
                </h3>
                <p className="text-sm font-semibold">
                  {order?.result.owner.phonenumber}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.deliveryMethod')}
                </h3>
                <p className="col-span-1 text-sm font-semibold">
                  {order?.result.type === 'at-table'
                    ? t('order.dineIn')
                    : t('order.takeAway')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.location')}
                </h3>
                <p className="col-span-1 text-sm font-semibold">
                  {order?.result.table && t('order.tableNumber')}{' '}
                  {order?.result.table ? order?.result.table.name : ''}
                </p>
              </div>
            </div>
          </div>
          {/* Thông tin đơn hàng */}
          <div className="w-full lg:w-2/3">
            <div className="grid w-full grid-cols-5 px-4 py-3 mb-2 text-sm font-thin rounded-md bg-muted-foreground/10">
              <span className="col-span-2 text-xs">{t('order.product')}</span>
              <span className="col-span-1 text-xs ">{t('order.unitPrice')}</span>
              <span className="col-span-1 text-xs text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-1 text-xs text-end">
                {t('order.grandTotal')}
              </span>
            </div>
            <div className="flex flex-col w-full border rounded-md">
              {order?.result.orderItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid items-center w-full gap-4 p-4 pb-4 border-b rounded-t-md"
                >
                  <div className="grid flex-row items-center w-full grid-cols-5">
                    <div className="flex w-full col-span-2 gap-2">
                      <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:justify-center w-full">
                        <span className="text-sm font-bold truncate sm:text-lg overflow-hidden text-ellipsis whitespace-nowrap w-full">
                          {item.variant.product.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center col-span-1">
                      {item.promotion ?
                        <div className='flex items-center gap-2'>
                          <span className="text-xs line-through text-muted-foreground hidden sm:block">
                            {`${formatCurrency(item.variant.price || 0)}`}
                          </span>
                          <span className="text-sm text-primary">
                            {`${formatCurrency(item.variant.price * (1 - item.promotion.value / 100) || 0)}`}
                          </span>
                        </div>
                        :
                        <span className="text-sm">
                          {`${formatCurrency(item.variant.price || 0)}`}
                        </span>}

                    </div>
                    <div className="flex justify-center col-span-1">
                      <span className="text-sm">{item.quantity || 0}</span>
                    </div>
                    <div className="col-span-1 text-end">
                      <span className="text-sm">
                        {`${formatCurrency((item.subtotal || 0))}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-end w-full gap-2 px-2 py-4">
                <div className="flex w-[20rem] flex-col gap-2">
                  <div className="flex justify-between w-full pb-4 border-b">
                    <h3 className="text-sm font-medium">{t('order.total')}</h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {`${formatCurrency(originalTotal || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between w-full pb-4 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('order.discount')}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      - {`${formatCurrency(discount || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between w-full pb-4 border-b">
                    <h3 className="text-sm italic font-medium text-green-500">
                      {t('order.voucher')}
                    </h3>
                    <p className="text-sm italic font-semibold text-green-500">
                      - {`${formatCurrency(voucherDiscount || 0)}`}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between w-full">
                      <h3 className="font-semibold text-md">
                        {t('order.totalPayment')}
                      </h3>
                      <p className="text-lg font-semibold text-primary">
                        {`${formatCurrency(order?.result.subtotal || 0)}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({t('order.vat')})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Payment method */}
        <ClientPaymentMethodSelect
          paymentMethod={paymentMethod}
          qrCode={qrCode}
          total={order?.result ? order?.result.subtotal : 0}
          onSubmit={handleSelectPaymentMethod}
        />
        <div className="flex flex-wrap-reverse gap-2 justify-end py-6 px-2">
          {(paymentMethod === PaymentMethod.BANK_TRANSFER ||
            paymentMethod === PaymentMethod.CASH) &&
            <div className="flex gap-2">
              {paymentSlug ? <DownloadQrCode qrCode={qrCode} slug={slug} /> :
                <Button
                  disabled={isPendingInitiatePayment}
                  className="w-fit"
                  onClick={handleConfirmPayment}
                >
                  {isPendingInitiatePayment && <ButtonLoading />}
                  {t('paymentMethod.confirmPayment')}
                </Button>}
            </div>}
        </div>
      </div>
    </div>
  )
}
