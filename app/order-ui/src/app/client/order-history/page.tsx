import { NavLink, useNavigate, useParams } from 'react-router-dom'
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
import { publicFileURL, ROUTE } from '@/constants'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { formatCurrency } from '@/utils'
import { ProgressBar } from '@/components/app/progress'
import { OrderTypeEnum } from '@/types'

export default function OrderHistoryPage() {
  const { t } = useTranslation(['menu'])
  const { slug } = useParams()
  const { data: orderDetail } = useOrderBySlug(slug as string)
  const navigate = useNavigate()

  return (
    <div className="container py-5">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="sticky -top-1 z-10 flex flex-col items-center gap-2 bg-white py-2">
          <span className="flex w-full items-center justify-start gap-1 text-lg">
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
          <div className="flex w-full flex-col gap-4 lg:w-3/4">
            {/* Order info */}
            <div className="flex items-center justify-between rounded-sm border border-muted-foreground/30 p-3">
              <div className="">
                <p className="flex items-center gap-2 pb-2">
                  <span className="font-bold">Đơn hàng:</span>{' '}
                  <span className="text-muted-foreground">
                    {orderDetail?.result?.slug}
                  </span>
                </p>
                <div className="flex flex-col gap-1 text-sm font-thin sm:flex-row sm:items-center">
                  <p>
                    Thời gian đặt hàng:{' '}
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
              <div className="rounded-sm border border-muted-foreground/30 sm:grid-cols-2">
                <div className="bg-muted-foreground/10 px-3 py-2 font-bold">
                  Khách hàng
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {`${orderDetail?.result?.owner?.firstName} ${orderDetail?.result?.owner?.lastName} (${orderDetail?.result?.owner?.phonenumber})`}
                  </p>
                </div>
              </div>
              <div className="rounded-sm border border-muted-foreground/30 sm:grid-cols-2">
                <div className="bg-muted-foreground/10 px-3 py-2 font-bold">
                  Loại đơn hàng
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
              <Table className="min-w-full table-auto border-collapse border border-muted-foreground/20">
                <TableCaption>A list of orders.</TableCaption>
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
                              className="aspect-square h-full w-full rounded-md object-cover"
                            />
                            <div className="absolute -bottom-2 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white sm:h-10 sm:w-10">
                              x{item.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm">
                          {item.variant.product.name} - Size{' '}
                          {item.variant.size.name.toUpperCase()}
                        </span>
                        <NavLink
                          to={`${ROUTE.CLIENT_MENU}/${item.variant.product.slug}`}
                        >
                          <Button variant="outline">Mua lại</Button>
                        </NavLink>
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
            <div className="rounded-sm border border-muted-foreground/30">
              <div className="bg-muted-foreground/10 px-3 py-2 font-bold">
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
            <div className="rounded-sm border border-muted-foreground/30">
              <div className="bg-muted-foreground/10 px-3 py-2 font-bold">
                Thông tin thanh toán
              </div>
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Tạm tính</p>
                  <p className="text-sm">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Thành tiền</p>
                  <p className="text-sm">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <p className="text-md font-semibold">Tổng tiền thanh toán</p>
                  <p className="text-xl font-bold text-primary">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    ({orderDetail?.result?.orderItems?.length} sản phẩm)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Đã bao gồm VAT)
                  </p>
                </div>
              </div>
            </div>
            {/* Return order button */}
            <div className="flex justify-start">
              <Button
                className="w-fit bg-primary"
                onClick={() => {
                  navigate(`${ROUTE.CLIENT_PROFILE}?tab=history`)
                }}
              >
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
