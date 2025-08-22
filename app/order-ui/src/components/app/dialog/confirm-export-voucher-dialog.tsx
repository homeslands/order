import jsPDF from 'jspdf'
import moment from 'moment'
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
    showToast(tToast('toast.exportVouchersSuccess'))
  }

  const exportVouchersAsPDF = async (vouchers: IVoucher[]) => {
    if (!vouchers || vouchers.length === 0) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: [5, 2], // Kích thước nhãn 5cm x 2cm
    });

    for (const [index, voucher] of vouchers.entries()) {
      if (index !== 0) pdf.addPage();

      // ==== Layout constants ====
      const pageWidth = 5;
      const pageHeight = 2;

      const fontSize = 8; // Font lớn hơn để dễ đọc
      const lineSpacing = 0.3; // Khoảng cách giữa 2 dòng (cm)
      const lineHeight = fontSize * 0.035; // Ước lượng chiều cao 1 dòng (cm)

      const totalTextHeight = lineHeight * 2 + lineSpacing; // Tổng chiều cao 2 dòng và khoảng cách
      const textYStart = (pageHeight - totalTextHeight) / 2 + lineHeight; // Vị trí dòng đầu tiên (căn giữa dọc)

      const textX = pageWidth / 2; // Căn giữa ngang

      // Text content
      const codeLine = `Code: ${voucher.code}`;
      const dateLine = `HSD: ${moment(voucher.startDate).format('DD/MM/YYYY')} - ${moment(voucher.endDate).format('DD/MM/YYYY')}`;

      // Set font
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0);

      // Draw text (centered)
      pdf.text(codeLine, textX, textYStart, { align: 'center' });
      pdf.text(dateLine, textX, textYStart + lineHeight + lineSpacing, { align: 'center' });
    }

    pdf.save('Voucher-tickets.pdf');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="flex items-center w-full text-sm"
          onClick={() => onOpenChange(true)}
        >
          <Download className="w-4 h-4" />
          {t('voucher.exportVouchers')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('voucher.exportVouchers')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('voucher.confirmExportVouchers')}
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
            {t('voucher.exportVouchers')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
