import { CreateTableDialog } from '@/components/app/dialog'
import { CreateMultipleTablesSheet } from '@/components/app/sheet'

export default function PromotionAction() {
  return (
    <div className="flex gap-2">
      <CreateTableDialog />
      <CreateMultipleTablesSheet />
    </div>
  )
}
