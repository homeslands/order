import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'
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
import { publicFileURL, ROUTE } from '@/constants'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { formatCurrency } from '@/utils'
import { ProgressBar } from '@/components/app/progress'
import { OrderTypeEnum } from '@/types'
import _ from 'lodash'

export default function OrderHistoryPage() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { slug } = useParams()
  const { data: orderDetail } = useOrderBySlug(slug as string)
  const navigate = useNavigate()
  if (_.isEmpty(orderDetail?.result)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <CircleX className="w-32 h-32 text-destructive" />
          <p className="text-center text-muted-foreground">
            {t('menu.noData')}
          </p>
          <Button variant="default" onClick={() => navigate(-1)}>
            {tCommon('common.goBack')}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="container py-5">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="sticky z-10 flex flex-col items-center gap-2 py-2 bg-white -top-1">
          <span className="flex items-center justify-start w-full gap-1 text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
            {/* <span className="text-muted-foreground">
              #{orderDetail?.result?.slug}
            </span> */}
          </span>
        </div>
        <ProgressBar step={orderDetail?.result.status} />

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col w-full gap-4 lg:w-3/4">
            {/* Order info */}
            <div className="flex items-center justify-between p-3 border rounded-sm border-muted-foreground/30">
              <div className="">
                <p className="flex items-center gap-2 pb-2">
                  <span className="font-bold">
                    {t('order.order')}{' '}
                  </span>
                  <span className="text-muted-foreground">
                    {orderDetail?.result?.slug}
                  </span>
                </p>
                <div className="flex flex-col gap-1 text-sm font-thin sm:flex-row sm:items-center">
                  <p>
                    {t('order.orderTime')}{' '}
                    <span className="text-muted-foreground">
                      {moment(orderDetail?.result?.createdAt).format(
                        'hh:mm:ss DD/MM/YYYY',
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order owner info */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="border rounded-sm border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.customer')}{' '}
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {`${orderDetail?.result?.owner?.firstName} ${orderDetail?.result?.owner?.lastName} (${orderDetail?.result?.owner?.phonenumber})`}
                  </p>
                </div>
              </div>
              <div className="border rounded-sm border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.orderType')}
                </div>
                <div className="px-3 py-2 text-sm">
                  <p>
                    {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                      ? t('order.dineIn')
                      : t('order.takeAway')}{' '}
                    - {t('order.tableNumber')}{' '}
                    {orderDetail?.result?.table?.name}
                  </p>
                </div>
              </div>
            </div>
            {/* Order table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border border-collapse table-auto border-muted-foreground/20">
                <TableCaption>
                  {t('order.aListOfOrders')}
                </TableCaption>
                <TableHeader className="rounded bg-muted-foreground/10">
                  <TableRow>
                    <TableHead className="">{t('order.product')}</TableHead>
                    <TableHead className="text-right">
                      {t('order.unitPrice')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('order.grandTotal')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetail?.result.orderItems?.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell className="flex flex-col gap-3 font-bold sm:flex-row sm:items-center">
                        <div className="relative col-span-4">
                          <div className="relative h-[8rem] w-full cursor-pointer">
                            <img
                              src={`${publicFileURL}/${item.variant.product.image}`}
                              alt={item.variant.product.name}
                              className="object-cover w-full h-full rounded-md aspect-square"
                            />
                            <div className="absolute flex items-center justify-center text-sm text-white rounded-full -bottom-2 -right-3 h-7 w-7 bg-primary sm:h-10 sm:w-10">
                              x{item.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm">
                          {item.variant.product.name} - Size{' '}
                          {item.variant.size.name.toUpperCase()}
                        </span>
                      </TableCell>
                      {/* <TableCell className='text-center'>{item.quantity}</TableCell> */}
                      <TableCell className="text-right">
                        {`${formatCurrency(orderDetail.result.subtotal)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {`${formatCurrency((item.variant.price || 0) * item.quantity)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right, payment*/}
          <div className="grid w-full grid-cols-1 gap-2 lg:w-1/4">
            {/* Payment method, status */}
            <div className="border rounded-sm border-muted-foreground/30">
              <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                {t('paymentMethod.title')}
              </div>
              <div className="px-3 py-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm">
                    {orderDetail?.result?.payment?.paymentMethod && (
                      <>
                        {orderDetail?.result?.payment.paymentMethod ===
                          'bank-transfer' && (
                            <span className="italic">
                              {t('paymentMethod.bankTransfer')}
                            </span>
                          )}
                        {orderDetail?.result?.payment.paymentMethod ===
                          'cash' && (
                            <span className="italic">
                              {t('paymentMethod.cash')}
                            </span>
                          )}
                      </>
                    )}
                  </span>
                  <div className="flex">
                    {orderDetail?.result?.payment && (
                      <PaymentStatusBadge
                        status={orderDetail?.result?.payment?.statusCode}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Total */}
            <div className="border rounded-sm border-muted-foreground/30">
              <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                {t('order.paymentInformation')}
              </div>
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('order.subTotal')}
                  </p>
                  <p className="text-sm">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('order.totalPrice')}
                  </p>
                  <p className="text-sm">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-md">
                    {t('order.totalPayment')}
                  </p>
                  <p className="text-xl font-bold text-primary">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    ({orderDetail?.result?.orderItems?.length} {t('order.product')})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({t('order.vat')})
                  </p>
                </div>
              </div>
            </div>
            {/* Return order button */}
            <div className="flex justify-between gap-2">
              <Button
                className="w-fit bg-primary"
                onClick={() => {
                  navigate(`${ROUTE.CLIENT_PROFILE}?tab=history`)
                }}
              >
                {tCommon('common.goBack')}
              </Button>
              <Button
                className="w-fit bg-primary"
                onClick={() => {
                  navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderDetail?.result?.slug}`)
                }}
              >
                {tCommon('common.checkout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
