import { useTranslation } from 'react-i18next'
import { Download, TriangleAlert } from 'lucide-react'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

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

import { showToast } from '@/utils'
import { IVoucher } from '@/types'

interface IConfirmExportVoucherDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedVouchers: IVoucher[]
  disabled?: boolean
  onSuccess: () => void
}

export default function ConfirmExportVoucherDialog({
  isOpen,
  onOpenChange,
  selectedVouchers,
  disabled,
  onSuccess,
}: IConfirmExportVoucherDialogProps) {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')

  const handleExport = async () => {
    await exportVouchersAsPDF(selectedVouchers)
    onOpenChange(false)
    onSuccess()
    showToast(tToast('toast.exportPDFVouchersSuccess'))
  }

  const exportVouchersAsPDF = async (vouchers: IVoucher[]) => {
    if (!vouchers || vouchers.length === 0) return

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: [5, 3], // 5cm x 3cm
    })

    for (const [index, voucher] of vouchers.entries()) {
      if (index !== 0) pdf.addPage()

      // QR code
      const qrDataUrl = await QRCode.toDataURL(voucher.slug || '', {
        width: 96,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      // ==== Layout constants ====
      const pageWidth = 5
      const qrSize = 1.6
      const qrX = (pageWidth - qrSize) / 2

      const qrY = 0.3          // tăng lên để qr hơi cao hơn
      const textYStart = qrY + qrSize + 0.4  // tăng khoảng cách qr -> text thành 0.4cm
      const lineSpacing = 0.3   // giảm khoảng cách 2 dòng text xuống còn 0.3cm

      // Draw QR
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

      // Text config
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6) // font size 6pt
      pdf.setTextColor(0, 0, 0)

      const codeLine = `Code: ${voucher.code}`
      const dateLine = `HSD: ${new Date(voucher.startDate).toLocaleDateString()} - ${new Date(voucher.endDate).toLocaleDateString()}`

      const textX = pageWidth / 2

      // Draw centered text
      pdf.text(codeLine, textX, textYStart, { align: 'center' })
      pdf.text(dateLine, textX, textYStart + lineSpacing, { align: 'center' })
    }

    pdf.save('Voucher-tickets.pdf')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="flex items-center w-full text-sm sm:w-[8rem]"
          onClick={() => onOpenChange(true)}
        >
          <Download className="w-4 h-4" />
          {t('voucher.exportVoucher')}
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
            onClick={() => onOpenChange(false)}
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
