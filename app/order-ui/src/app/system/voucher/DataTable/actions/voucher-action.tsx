import { CreateMultipleVoucherSheet, CreateVoucherSheet } from '@/components/app/sheet'

export default function VoucherAction({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="flex gap-2">
      <CreateVoucherSheet onSuccess={onSuccess} />
      <CreateMultipleVoucherSheet onSuccess={onSuccess} />
    </div>
  )
}


