import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'

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
import { useExportPublicOrderInvoice, useIsMobile, useOrderBySlug } from '@/hooks'
import { publicFileURL, ROUTE } from '@/constants'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { formatCurrency, showToast } from '@/utils'
import { ProgressBar } from '@/components/app/progress'
import { OrderStatus, OrderTypeEnum } from '@/types'
import { InvoiceTemplate } from '../public-order-detail/components'

export default function OrderHistoryPage() {
  const isMobile = useIsMobile()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const order = searchParams.get('order')
  const { mutate: exportPublicOrderInvoice } = useExportPublicOrderInvoice()
  const { data: orderDetail } = useOrderBySlug(order || '')

  const orderInfo = orderDetail?.result
  const originalTotal = orderInfo
    ? orderInfo.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
    : 0;

  const discount = orderInfo
    ? orderInfo.orderItems.reduce(
      (sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0),
      0
    )
    : 0;

  const voucherDiscount = orderInfo?.voucher ? (originalTotal - discount) * ((orderInfo.voucher.value) / 100) : 0;
  if (_.isEmpty(orderDetail?.result)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col gap-5 justify-center items-center">
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

  const handleExportInvoice = () => {
    exportPublicOrderInvoice(orderDetail?.result?.slug || '', {
      onSuccess: () => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        // loadDataToPrinter(data)
      },
    })
  }
  return (
    <div className="container py-5">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="flex sticky -top-1 z-10 flex-col gap-2 items-center py-2 bg-white dark:bg-transparent">
          <span className="flex gap-1 justify-start items-center w-full text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
          </span>
        </div>
        <ProgressBar step={orderInfo?.status} />
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col gap-4 w-full lg:w-3/5">
            {/* Order info */}
            <div className="flex justify-between items-center p-3 rounded-sm border border-muted-foreground/30">
              <div className="">
                <p className="flex gap-2 items-center pb-2">
                  <span className="font-bold">
                    {t('order.order')}{' '}
                  </span>
                  <span className="text-muted-foreground">
                    #{orderInfo?.slug}
                  </span>
                </p>
                <div className="flex flex-col gap-1 text-sm font-thin sm:flex-row sm:items-center">
                  <p>
                    {t('order.orderTime')}{' '}
                    <span className="text-muted-foreground">
                      {moment(orderInfo?.createdAt).format(
                        'hh:mm:ss DD/MM/YYYY',
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order owner info */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-sm border border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.customer')}{' '}
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {`${orderInfo?.owner?.firstName} ${orderInfo?.owner?.lastName} (${orderInfo?.owner?.phonenumber})`}
                  </p>
                </div>
              </div>
              <div className="rounded-sm border border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.orderType')}
                </div>
                <div className="px-3 py-2 text-sm">
                  <p>
                    {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                      ? <span>{t('order.dineIn')} - {t('order.tableNumber')}{' '}{orderDetail?.result?.table?.name}</span>
                      : t('order.takeAway')}{' '}
                  </p>
                </div>
              </div>
            </div>
            {/* Order table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border border-collapse table-auto border-muted-foreground/20">
                <TableCaption>{t('order.aListOfOrders')}</TableCaption>

                {/* Header */}
                <TableHeader className="rounded bg-muted-foreground/10">
                  <TableRow>
                    <TableHead className="w-3/5 text-left">{t('order.product')}</TableHead>
                    <TableHead className="w-2/5 text-right">{t('order.grandTotal')}</TableHead>
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                  {orderInfo?.orderItems?.map((item) => (
                    <TableRow key={item.slug}>
                      {/* Cột hình ảnh + thông tin */}
                      <TableCell className="flex gap-5 items-center font-bold">
                        <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.variant.product.slug}`} className="flex gap-5 items-center">
                          {/* Hình ảnh */}
                          <div className="relative h-[3.5rem] w-[3.5rem] sm:h-[6.5rem] sm:w-[6.5rem] cursor-pointer">
                            <img
                              src={`${publicFileURL}/${item.variant.product.image}`}
                              alt={item.variant.product.name}
                              className="object-cover w-full h-full rounded-md aspect-square"
                            />
                            <div className="flex absolute -bottom-3 left-10 justify-center items-center w-7 h-7 text-sm text-white rounded-full sm:-bottom-3 sm:-right-3 sm:left-auto bg-primary">
                              x{item.quantity}
                            </div>
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold truncate">{item?.variant?.product?.name}</span>
                            {item?.promotion && item?.promotion?.value > 0 ? (
                              <div className="flex flex-row gap-1 items-center">
                                <span className="text-xs font-normal">Size {item?.variant?.size?.name.toUpperCase()}</span>
                                <span className="text-xs line-through text-muted-foreground/60">
                                  {formatCurrency(item?.variant?.price || 0)}
                                </span>
                                <span className="font-semibold text-primary">
                                  {formatCurrency(item?.variant?.price * (1 - item?.promotion?.value / 100))}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Size {item?.variant?.size?.name.toUpperCase()} - {formatCurrency(item?.variant?.price || 0)}
                              </div>
                            )}
                          </div>
                        </NavLink>
                      </TableCell>

                      {/* Cột tổng giá */}
                      <TableCell className="w-1/4 font-semibold text-right">
                        {formatCurrency(item?.subtotal || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right, payment*/}
          <div className="flex flex-col gap-2 w-full lg:w-2/5">
            {/* Payment method, status */}
            <div className="rounded-sm border h-fit border-muted-foreground/30">
              <div className="px-3 py-4 font-bold bg-muted-foreground/10">
                {t('paymentMethod.title')}
              </div>
              {orderInfo?.payment ? (
                <div className="px-3 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm">
                      {orderInfo?.payment?.paymentMethod && (
                        <>
                          {orderInfo?.payment.paymentMethod ===
                            'bank-transfer' && (
                              <span className="italic">
                                {t('paymentMethod.bankTransfer')}
                              </span>
                            )}
                          {orderInfo?.payment.paymentMethod ===
                            'cash' && (
                              <span className="italic">
                                {t('paymentMethod.cash')}
                              </span>
                            )}
                        </>
                      )}
                    </span>
                    <div className="flex">
                      {orderInfo?.payment && (
                        <PaymentStatusBadge
                          status={orderInfo?.payment?.statusCode}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    {t('paymentMethod.notPaid')}
                  </p>
                </div>
              )}
            </div>
            {/* Total */}
            <div className="rounded-sm border border-muted-foreground/30">
              <div className="px-3 py-3 font-bold bg-muted-foreground/10">
                {t('order.paymentInformation')}
              </div>
              <div className="flex flex-col gap-2 px-3 py-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('order.subTotal')}
                  </p>
                  <p className="text-sm">{`${formatCurrency(originalTotal || 0)}`}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('order.discount')}
                  </p>
                  <p className="text-sm text-muted-foreground">{`- ${formatCurrency(discount || 0)}`}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm italic text-green-500">
                    {t('order.voucher')}
                  </p>
                  <p className="text-sm italic text-green-500">{`- ${formatCurrency(voucherDiscount || 0)}`}</p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-md">
                    {t('order.totalPayment')}
                  </p>
                  <p className="text-2xl font-extrabold text-primary">{`${formatCurrency(orderInfo?.subtotal || 0)}`}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    ({orderInfo?.orderItems?.length} {t('order.product')})
                  </p>
                  {/* <p className="text-xs text-muted-foreground">
                    ({t('order.vat')})
                  </p> */}
                </div>
              </div>
            </div>
            {isMobile && orderInfo?.status === OrderStatus.PAID && (
              <div className='flex flex-col justify-center items-center mt-12 w-full'>
                <span className='text-lg text-muted-foreground'>
                  {t('order.invoice')}
                </span>
                <InvoiceTemplate
                  order={orderInfo}
                />
              </div>
            )}
            {/* Return order button */}
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  navigate(`${ROUTE.CLIENT_PROFILE}?tab=history`)
                }}
              >
                {tCommon('common.goBack')}
              </Button>
              {orderDetail?.result?.status === OrderStatus.PENDING ?
                (<Button
                  className="w-fit bg-primary"
                  onClick={() => {
                    navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderDetail?.result?.slug}`)
                  }}
                >
                  {tCommon('common.checkout')}
                </Button>) : null}
            </div>
          </div>
        </div>
        {!isMobile && orderInfo?.status === OrderStatus.PAID && (
          <div className='flex flex-col justify-center items-center mt-12 w-full'>
            <span className='text-lg text-muted-foreground'>
              {t('order.invoice')}
            </span>
            <InvoiceTemplate
              order={orderInfo}
            />

            <Button onClick={() => {
              handleExportInvoice()
            }}>
              {t('order.exportInvoice')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
