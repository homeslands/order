import { ConfirmExportVoucherDialog } from '@/components/app/dialog'
import { VoucherToolDropdown } from '@/components/app/dropdown'
import { IVoucher } from '@/types'

export default function VoucherAction({ onSuccess, selectedVouchers, onOpenChange, isConfirmExportVoucherDialogOpen }: { onSuccess: () => void, selectedVouchers: IVoucher[], onOpenChange: (isOpen: boolean) => void, isConfirmExportVoucherDialogOpen: boolean }) {
  return (
    <div className="flex gap-2">
      <ConfirmExportVoucherDialog
        disabled={selectedVouchers.length === 0}
        isOpen={isConfirmExportVoucherDialogOpen}
        onOpenChange={onOpenChange}
        selectedVouchers={selectedVouchers}
        onSuccess={onSuccess}
      />
      <VoucherToolDropdown onSuccess={onSuccess} />
    </div>
  )
}


