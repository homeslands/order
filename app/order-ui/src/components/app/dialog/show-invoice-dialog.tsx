import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt, DownloadIcon, Loader2 } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea
} from '@/components/ui'

import { IOrder } from '@/types'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import { PaymentStatusBadge } from '../badge'
import { useExportOrderInvoice } from '@/hooks'
import { VOUCHER_TYPE } from '@/constants'

export default function ShowInvoiceDialog({ order }: { order: IOrder | null }) {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tVoucher } = useTranslation('voucher')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: exportOrderInvoice, isPending } = useExportOrderInvoice()

  if (!order) return null

  const { orderItems, payment, owner, subtotal, createdAt, voucher } = order

  const displayItems = calculateOrderItemDisplay(orderItems, voucher)
  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  const handleExportOrderInvoice = async (order: IOrder) => {
    exportOrderInvoice(order?.slug || '', {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportPDFVouchersSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }
  // const handleExportOrderInvoice = async (order: IOrder) => {
  //   await exportOrderInvoices(order)
  //   showToast(tToast('toast.exportPDFVouchersSuccess'))
  // }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center text-sm" onClick={() => setIsOpen(true)}>
          <Receipt className="w-5 h-5" />
          {t('order.showInvoice')}
        </Button>
      </DialogTrigger>

      <DialogContent className="px-0 rounded-lg shadow-lg sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center px-4 pb-3 mt-4 border-b">
            <div className="flex gap-2 items-center">
              <Receipt className="w-5 h-5 text-primary" />
              {t('order.invoice')}
            </div>
            <span className="text-xs text-muted-foreground">#{order.slug}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-2 px-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 p-3 mb-2 text-sm rounded-md bg-muted-foreground/10">
            <div className="flex flex-col gap-1 text-sm font-bold text-left">
              <p>{t('order.customerName')}:</p>
              <p>{t('order.phoneNumber')}:</p>
              <p>{t('order.orderDate')}:</p>
              <p>{t('order.orderType')}:</p>
              <p>{t('order.note')}:</p>
            </div>
            <div className="flex flex-col gap-1 font-normal text-left">
              <p>{owner.firstName} {owner.lastName}</p>
              <p>{owner.phonenumber}</p>
              <p>{new Date(createdAt).toLocaleString()}</p>
              <p>
                {order.type === 'at-table' ? t('order.dineIn') : t('order.takeAway')}
              </p>
              <p>{order.description}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-2 text-sm">
            <h3 className="mb-2 font-semibold">{t('order.orderItems')}</h3>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted-foreground/15">
                  <tr>
                    <th className="p-2 text-left">{t('order.item')}</th>
                    <th className="p-2 text-left">{t('order.note')}</th>
                    <th className="p-2 text-center">{t('order.quantity')}</th>
                    <th className="p-2 text-right">{t('order.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item) => (
                    <tr key={item.slug} className="border-b">
                      <td className="p-2">{item.variant.product.name}</td>
                      <td className="p-2">{item.note}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency((item.finalPrice || 0) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          <div className="flex flex-col gap-2 p-3 text-sm rounded-md bg-muted-foreground/10">
            {payment ? (
              <p><strong>{t('order.paymentMethod')}:</strong> {t(`order.${payment?.paymentMethod}`)}</p>
            ) : (
              <p><strong>{t('order.paymentMethod')}:</strong> {t('order.pending')}</p>
            )}
            <p className="flex gap-2 items-center">
              <strong>{t('order.status')}:</strong>
              <PaymentStatusBadge status={payment?.statusCode} />
            </p>
            {order?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex flex-col items-start">
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-sm font-semibold">
                      {t('order.usedVoucher')}:
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border border-primary bg-primary/20 text-primary">
                      -{`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                    </span>
                  </div>

                  {/* Hiển thị nội dung chi tiết theo loại voucher */}
                  <div className="mt-1 text-xs italic text-muted-foreground">
                    {(() => {
                      const voucher = order?.voucher
                      if (!voucher) return null

                      switch (voucher.type) {
                        case VOUCHER_TYPE.PERCENT_ORDER:
                          return `${tVoucher('voucher.discountValue')}${voucher.value}% ${tVoucher('voucher.orderValue')}`

                        case VOUCHER_TYPE.FIXED_VALUE:
                          return `${tVoucher('voucher.discountValue')}${formatCurrency(voucher.value)} ${tVoucher('voucher.orderValue')}`

                        case VOUCHER_TYPE.SAME_PRICE_PRODUCT:
                          return `${tVoucher('voucher.samePrice')} ${formatCurrency(voucher.value)} ${tVoucher('voucher.forSelectedProducts')}`

                        default:
                          return ''
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Total Amount */}
        <div className="flex justify-between items-center p-3 px-4 rounded-md bg-primary/10">
          <span className="text-sm font-semibold">{t('order.total')}:</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(subtotal)}</span>
        </div>
        <DialogFooter className="px-4">
          <Button className='w-full' onClick={() => handleExportOrderInvoice(order)} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadIcon />}
            {t('order.exportInvoice')}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}