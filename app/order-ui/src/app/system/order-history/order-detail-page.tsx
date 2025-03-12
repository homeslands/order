import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'
import moment from 'moment'

import {
  Button,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useOrderBySlug } from '@/hooks'
import { publicFileURL } from '@/constants'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { OrderTypeEnum } from '@/types'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { formatCurrency } from '@/utils'
import { Helmet } from 'react-helmet'

export default function OrderDetailPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { t: tCommon } = useTranslation('common')
  const { slug } = useParams()
  const { data: orderDetail } = useOrderBySlug(slug as string)
  const navigate = useNavigate()

  const orderInfo = orderDetail?.result;

  const originalTotal = orderInfo
    ? orderInfo.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
    : 0;

  const discount = orderInfo
    ? orderInfo.orderItems.reduce(
      (sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0),
      0
    )
    : 0;

  return (
    <div className="mb-10">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.orderDetail.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.orderDetail.title')} />
      </Helmet>
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="top-0 z-10 flex flex-col items-center gap-2 pb-4">
          <span className="flex items-center justify-start w-full gap-1 text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
            <span className="text-muted-foreground">
              #{orderInfo?.slug}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col w-full gap-4 lg:w-3/5">
            {/* Order info */}
            <div className="flex items-center justify-between p-3 border rounded-sm">
              <div className="">
                <p className="flex items-center gap-2 pb-2">
                  <span className="font-bold">
                    {t('order.order')}{' '}
                  </span>{' '}
                  <span className="text-primary">
                    #{orderInfo?.slug}
                  </span>
                  <OrderStatusBadge order={orderInfo || undefined} />
                </p>
                <div className="flex items-center gap-1 text-sm font-thin">
                  <p>
                    {moment(orderInfo?.createdAt).format(
                      'hh:mm:ss DD/MM/YYYY',
                    )}
                  </p>{' '}
                  |
                  <p className="flex items-center gap-1">
                    <span>
                      {t('order.cashier')}{' '}
                    </span>
                    <span className="text-muted-foreground">
                      {`${orderInfo?.owner?.firstName} ${orderInfo?.owner?.lastName} - ${orderDetail?.result?.owner?.phonenumber}`}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order owner info */}
            <div className="flex gap-2">
              <div className="w-1/2 border rounded-sm">
                <div className="px-3 py-2 font-bold uppercase">
                  {t('order.customer')}
                </div>
                <div className="px-3 py-2 text-xs">
                  <p className="font-bold">
                    {`${orderInfo?.owner?.firstName} ${orderInfo?.owner?.lastName}`}
                  </p>
                  <p className="text-sm">
                    {orderInfo?.owner?.phonenumber}
                  </p>
                </div>
              </div>
              <div className="w-1/2 border rounded-sm">
                <div className="px-3 py-2 font-bold uppercase">
                  {t('order.orderType')}
                </div>
                <div className="px-3 py-2 text-sm">
                  <p>
                    {orderInfo?.type === OrderTypeEnum.AT_TABLE
                      ? t('order.dineIn')
                      : t('order.takeAway')}
                  </p>
                  <p className="flex gap-1">
                    <span className="col-span-2">{t('order.tableNumber')}</span>
                    <span className="col-span-1">
                      {orderInfo?.table?.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border border-collapse table-auto">
                <TableCaption>A list of orders.</TableCaption>
                <TableHeader className={`rounded bg-muted-foreground/10 dark:bg-transparent`}>
                  <TableRow>
                    <TableHead className="">{t('order.product')}</TableHead>
                    <TableHead>{t('order.size')}</TableHead>
                    <TableHead>{t('order.quantity')}</TableHead>
                    <TableHead className="text-start">
                      {t('order.unitPrice')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('order.grandTotal')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderInfo?.orderItems?.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell className="flex items-center gap-1 font-bold">
                        <img
                          src={`${publicFileURL}/${item.variant.product.image}`}
                          alt={item.variant.product.image}
                          className="object-cover w-20 h-12 rounded-lg sm:h-16 sm:w-24"
                        />
                        {item.variant.product.name}
                      </TableCell>
                      <TableCell>{item.variant.size.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {item.promotion && item.promotion.value > 0 ? (
                          <div className="flex items-center justify-start gap-1">
                            <span className="text-sm line-through text-muted-foreground">
                              {`${formatCurrency(item?.variant?.price || 0)}`}
                            </span>
                            <span className="text-sm sm:text-lg text-primary">
                              {`${formatCurrency(item?.variant?.price * (1 - item?.promotion?.value / 100))}`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start justify-start gap-1">
                            <span className="text-sm text-muted-foreground">
                              {`${formatCurrency(item?.variant?.price || 0)}`}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-lg font-extrabold text-right text-primary">
                        {`${formatCurrency((item.variant.price || 0) * item.quantity)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right, payment*/}
          <div className="flex flex-col w-full gap-2 lg:w-2/5">
            {/* Payment method, status */}
            <div className="border rounded-sm">
              <div className="px-3 py-2">
                <p className="flex flex-col items-start gap-1 pb-2">
                  <span className="col-span-1 text-sm font-bold">
                    {t('paymentMethod.title')}
                  </span>
                  <span className="text-xs">
                    {orderInfo?.payment?.paymentMethod && (
                      <>
                        {orderInfo?.payment.paymentMethod ===
                          'bank-transfer' && (
                            <span>{t('paymentMethod.bankTransfer')}</span>
                          )}
                        {orderInfo?.payment.paymentMethod ===
                          'cash' && <span>{t('paymentMethod.cash')}</span>}
                      </>
                    )}
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="col-span-1 text-xs font-semibold">
                    {t('paymentMethod.status')}
                  </span>
                  <span className="col-span-1 text-xs">
                    {orderInfo?.payment && (
                      <PaymentStatusBadge
                        status={orderInfo?.payment?.statusCode}
                      />
                    )}
                  </span>
                </p>
              </div>
            </div>
            {/* Total */}
            <div className="flex flex-col gap-2 p-2 border rounded-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('order.subtotal')}
                </p>
                <p>{`${formatCurrency(originalTotal || 0)}`}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm italic text-green-500">
                  {t('order.discount')}
                </p>
                <p className='text-sm italic text-green-500'>{`- ${formatCurrency(discount || 0)}`}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('order.totalPayment')}
                </p>
                <p className="text-xl font-bold text-primary">{`${formatCurrency(orderInfo?.subtotal || 0)}`}</p>
              </div>
              <div className="flex items-center justify-between">
                {/* <p className="text-sm text-muted-foreground">
                  ({orderInfo?.orderItems?.length}{' '}{t('order.product')})
                </p> */}
                <p className="text-xs text-muted-foreground/80">({t('order.vat')})</p>
              </div>
            </div>
            {/* Return order button */}
            <Button
              className="w-full bg-primary"
              onClick={() => {
                navigate(-1)
              }}
            >
              {tCommon('common.goBack')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
