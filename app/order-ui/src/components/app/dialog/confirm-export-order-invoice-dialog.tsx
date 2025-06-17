import moment from 'moment'
import jsPDF from 'jspdf'
import { QRCodeSVG } from 'qrcode.react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { Download, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { loadDataToPrinter, showToast } from '@/utils'
import { IOrder } from '@/types'

interface IConfirmExportOrderInvoiceDialogProps {
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  order?: IOrder
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmExportOrderInvoiceDialog({
  isOpen,
  onOpenChange,
  order,
  disabled,
  onSuccess,
}: IConfirmExportOrderInvoiceDialogProps) {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')

  const handleExport = async () => {
    await exportOrderInvoices(order)
    onOpenChange?.(false)
    onSuccess?.()
    showToast(tToast('toast.exportInvoiceSuccess'))
  }

  const exportOrderInvoices = async (order: IOrder | undefined) => {
    if (!order) return

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: [5, 3], // 5cm x 3cm
    })

    try {
      // Create temporary container for QR code
      const container = document.createElement('div')
      const root = createRoot(container)
      root.render(
        <QRCodeSVG
          value={order.slug || ''}
          size={96}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      )

      // Wait for QR code to render
      await new Promise(resolve => setTimeout(resolve, 100))

      // Convert SVG to PNG
      const svgElement = container.querySelector('svg')
      if (!svgElement) throw new Error('QR code SVG not found')

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      canvas.width = 96
      canvas.height = 96
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const img = new Image()
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          resolve(null)
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load SVG image'))
        }
        img.src = url
      })

      // ==== Layout constants ====
      const pageWidth = 5
      const qrSize = 1.6
      const qrX = (pageWidth - qrSize) / 2
      const qrY = 0.3          // tăng lên để qr hơi cao hơn
      const textYStart = qrY + qrSize + 0.4  // tăng khoảng cách qr -> text thành 0.4cm
      const lineSpacing = 0.3   // giảm khoảng cách 2 dòng text xuống còn 0.3cm

      // Add QR code to PDF
      const pngData = canvas.toDataURL('image/png')
      pdf.addImage(pngData, 'PNG', qrX, qrY, qrSize, qrSize)

      // Text config
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6) // font size 6pt
      pdf.setTextColor(0, 0, 0)

      const codeLine = `Created at: ${moment(order.createdAt).format('DD/MM/YYYY')}`
      const dateLine = `Hoa don: ${order.referenceNumber}`

      const textX = pageWidth / 2

      // Draw centered text
      pdf.text(codeLine, textX, textYStart, { align: 'center' })
      pdf.text(dateLine, textX, textYStart + lineSpacing, { align: 'center' })

      // Cleanup
      root.unmount()

      const pdfBlob = pdf.output('blob')
      loadDataToPrinter(pdfBlob)
    } catch {
      showToast(tToast('toast.exportPDFVouchersError'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="flex items-center w-full text-sm sm:w-[8rem]"
          onClick={() => onOpenChange?.(true)}
        >
          <Download className="w-4 h-4" />
          {t('voucher.exportPDF')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.exportPDF')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmExportPDF')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={handleExport}
          >
            {t('voucher.exportPDF')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
