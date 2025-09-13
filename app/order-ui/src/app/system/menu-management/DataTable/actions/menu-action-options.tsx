import { CreateMenuDialog } from '@/components/app/dialog'
import { BranchSelect } from '@/components/app/select'

export default function MenuActionOptions() {
  return (
    <div className="flex gap-2">
      <BranchSelect />
      <CreateMenuDialog />
    </div>
  )
}
