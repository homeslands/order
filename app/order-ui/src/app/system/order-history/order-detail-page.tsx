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

export default function OrderDetailPage() {
  const { t } = useTranslation(['menu'])
  const { slug } = useParams()
  const { data: orderDetail } = useOrderBySlug(slug as string)
  const navigate = useNavigate()

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="top-0 z-10 flex flex-col items-center gap-2 pb-4">
          <span className="flex items-center justify-start w-full gap-1 text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
            <span className="text-muted-foreground">
              #{orderDetail?.result?.slug}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col w-full gap-4 lg:w-3/4">
            {/* Order info */}
            <div className="flex items-center justify-between p-3 border rounded-sm">
              <div className="">
                <p className="flex items-center gap-2 pb-2">
                  <span className="font-bold">Đơn hàng:</span>{' '}
                  <span className="text-primary">
                    #{orderDetail?.result?.slug}
                  </span>
                  <OrderStatusBadge order={orderDetail?.result || undefined} />
                </p>
                <div className="flex items-center gap-1 text-sm font-thin">
                  <p>
                    {moment(orderDetail?.result?.createdAt).format(
                      'hh:mm:ss DD/MM/YYYY',
                    )}
                  </p>{' '}
                  |
                  <p className="flex items-center gap-1">
                    <span>Thu ngân:</span>
                    <span className="text-muted-foreground">
                      {`${orderDetail?.result?.owner?.firstName} ${orderDetail?.result?.owner?.lastName} - ${orderDetail?.result?.owner?.phonenumber}`}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order owner info */}
            <div className="flex gap-2">
              <div className="w-1/2 border rounded-sm">
                <div className="px-3 py-2 font-bold uppercase">
                  Khách hàng
                </div>
                <div className="px-3 py-2 text-xs">
                  <p className="font-bold">
                    {`${orderDetail?.result?.owner?.firstName} ${orderDetail?.result?.owner?.lastName}`}
                  </p>
                  <p className="text-sm">
                    {orderDetail?.result?.owner?.phonenumber}
                  </p>
                </div>
              </div>
              <div className="w-1/2 border rounded-sm">
                <div className="px-3 py-2 font-bold uppercase">
                  Loại đơn hàng
                </div>
                <div className="px-3 py-2 text-sm">
                  <p>
                    {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                      ? t('order.dineIn')
                      : t('order.takeAway')}
                  </p>
                  <p className="flex gap-1">
                    <span className="col-span-2">{t('order.tableNumber')}</span>
                    <span className="col-span-1">
                      {orderDetail?.result?.table?.name}
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
                        {`${formatCurrency(item.variant.price || 0)}`}
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
          <div className="flex flex-col w-full gap-2 lg:w-1/4">
            {/* Payment method, status */}
            <div className="border rounded-sm">
              {/* <div className="px-3 py-2 font-bold uppercase">
                Phương thức thanh toán
              </div> */}
              <div className="px-3 py-2">
                <p className="flex flex-col items-start gap-1 pb-2">
                  <span className="col-span-1 text-sm font-bold">
                    {t('paymentMethod.title')}
                  </span>
                  <span className="text-xs">
                    {orderDetail?.result?.payment?.paymentMethod && (
                      <>
                        {orderDetail?.result?.payment.paymentMethod ===
                          'bank-transfer' && (
                            <span>{t('paymentMethod.bankTransfer')}</span>
                          )}
                        {orderDetail?.result?.payment.paymentMethod ===
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
                    {orderDetail?.result?.payment && (
                      <PaymentStatusBadge
                        status={orderDetail?.result?.payment?.statusCode}
                      />
                    )}
                  </span>
                </p>
              </div>
            </div>
            {/* Total */}
            <div className="flex flex-col gap-2 p-2 border rounded-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tạm tính</p>
                <p>{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Thành tiền</p>
                <p>{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-gray-500">Cần thanh toán</p>
                <p className="text-2xl font-bold text-primary">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  ({orderDetail?.result?.orderItems?.length} sản phẩm )
                </p>
                <p className="text-sm">(Đã bao gồm VAT)</p>
              </div>
            </div>
            {/* Return order button */}
            <Button
              className="w-full bg-primary"
              onClick={() => {
                navigate(-1)
              }}
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
