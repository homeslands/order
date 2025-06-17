import moment from 'moment'
import ejs from 'ejs'
import QRCode from 'qrcode'
import i18next from 'i18next'

import { showToast } from './toast'
import { IExportOrderInvoiceParams, IOrder, OrderTypeEnum } from '@/types'
import { Be_Vietnam_Pro_base64 } from '@/assets/font/base64'
import { Logo } from '@/assets/images'
import { VOUCHER_TYPE } from '@/constants'

export const loadDataToPrinter = (blob: Blob) => {
  const blobURL = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe') //load content in an iframe to print later
  document.body.appendChild(iframe)

  iframe.style.display = 'none'
  iframe.src = blobURL
  iframe.onload = function () {
    setTimeout(function () {
      iframe.focus()
      iframe?.contentWindow?.print()
    }, 1)
  }
}

export const generateQRCodeBase64 = async (slug: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(slug, { width: 128 })
    return dataUrl // base64 string
  } catch {
    return ''
  }
}

export const generateInvoiceHTML = async (
  data: IExportOrderInvoiceParams,
): Promise<string> => {
  const templateText = await fetch('/templates/invoice-template.html').then(
    (res) => res.text(),
  )
  return ejs.render(templateText, data)
}

export const exportOrderInvoices = async (order: IOrder | undefined) => {
  if (!order) return

  let voucherValue = 0
  let orderPromotionValue = 0

  if (order?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER) {
    const voucherPercent = order.voucher.value
    const subtotalBeforeVoucher =
      (order.subtotal * 100) / (100 - voucherPercent)
    voucherValue += subtotalBeforeVoucher - order.subtotal
  }
  if (order?.voucher?.type === VOUCHER_TYPE.FIXED_VALUE) {
    voucherValue += order.voucher.value
  }

  const subtotalBeforeVoucher = order.orderItems?.reduce(
    (total, current) => total + current.subtotal,
    0,
  )

  // Calculate promotion value
  orderPromotionValue = order.orderItems.reduce(
    (acc, item) => acc + (item.promotion?.value || 0) * item.quantity,
    0,
  )

  try {
    const htmlContent = await generateInvoiceHTML({
      logoString: Be_Vietnam_Pro_base64,
      logo: Logo,
      branchAddress: order.invoice.branchAddress || '',
      referenceNumber: order.invoice.referenceNumber,
      createdAt: order.createdAt,
      type: order.type,
      tableName:
        order.type === OrderTypeEnum.AT_TABLE
          ? order.table?.name || ''
          : 'Mang đi',
      customer:
        order.owner?.firstName + ' ' + order.owner?.lastName || 'Khách lẻ',
      cashier:
        order.approvalBy?.firstName + ' ' + order.approvalBy?.lastName || '',
      invoiceItems: order.orderItems.map((item) => ({
        variant: {
          name: item.variant.product?.name || '',
          originalPrice: item.variant.price,
          price: item.subtotal,
          size: item.variant.size?.name || '',
        },
        quantity: item.quantity,
        promotionValue: item.promotion?.value || 0,
        subtotal: item.subtotal,
      })),
      promotionDiscount: orderPromotionValue,
      paymentMethod: order.payment?.paymentMethod || '',
      subtotalBeforeVoucher: subtotalBeforeVoucher,
      voucherType: order.voucher?.type || '',
      voucherValue: voucherValue,
      amount: order.invoice.amount,
      loss: order.loss,
      qrcode: await generateQRCodeBase64(order.slug),
      formatCurrency: (v: number) => new Intl.NumberFormat().format(v) + '₫',
      formatDate: (date: string, fmt: string) => moment(date).format(fmt),
      formatPaymentMethod: (method: string) =>
        method === 'CASH' ? 'Tiền mặt' : 'Khác',
    })

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showToast(i18next.t('toast.exportPDFVouchersError'))
      return
    }

    // Write the HTML content to the new window
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for resources to load
    printWindow.onload = () => {
      // Print the window
      printWindow.print()
      // Close the window after printing
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }
  } catch {
    showToast(i18next.t('toast.exportPDFVouchersError'))
  }
}
