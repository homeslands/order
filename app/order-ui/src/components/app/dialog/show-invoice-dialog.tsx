import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt, DownloadIcon } from 'lucide-react'

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
import { formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import { PaymentStatusBadge } from '../badge'
import { useExportOrderInvoice } from '@/hooks'

export default function ShowInvoiceDialog({ order }: { order: IOrder | undefined }) {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: exportOrderInvoice } = useExportOrderInvoice()

  if (!order) return null

  const { orderItems, payment, owner, subtotal, createdAt, voucher } = order

  const handleExportOrderInvoice = (slug: string) => {
    exportOrderInvoice(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center text-sm" onClick={() => setIsOpen(true)}>
          <Receipt className="w-5 h-5" />
          {t('order.showInvoice')}
        </Button>
      </DialogTrigger>

      <DialogContent className="px-0 rounded-lg shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center px-4 pb-3 border-b">
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
            </div>
            <div className="flex flex-col gap-1 font-normal text-left">
              <p>{owner.firstName} {owner.lastName}</p>
              <p>{owner.phonenumber}</p>
              <p>{new Date(createdAt).toLocaleString()}</p>
              <p>
                {order.type === 'at-table' ? t('order.dineIn') : t('order.takeAway')}
              </p>
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
                    <th className="p-2 text-center">{t('order.quantity')}</th>
                    <th className="p-2 text-right">{t('order.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.slug} className="border-b">
                      <td className="p-2">{item.variant.product.name}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.quantity * item.subtotal)}</td>
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
            {voucher && <p><strong>{t('order.voucher')}:</strong> {voucher?.title} - {t('order.discount')} {voucher.value}%</p>}
          </div>
        </ScrollArea>

        {/* Total Amount */}
        <div className="flex justify-between items-center p-3 px-4 rounded-md bg-primary/10">
          <span className="text-sm font-semibold">{t('order.total')}:</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(subtotal)}</span>
        </div>
        <DialogFooter className="px-4">
          <Button className='w-full' onClick={() => handleExportOrderInvoice(order.slug)}>
            <DownloadIcon />
            {t('order.exportInvoice')}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}