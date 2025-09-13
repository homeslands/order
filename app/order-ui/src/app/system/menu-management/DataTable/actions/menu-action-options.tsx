import { CreateMenuDialog } from '@/components/app/dialog'
import { BranchSelect } from '@/components/app/select'

export default function MenuActionOptions() {
  return (
    <>
      <BranchSelect />
      <CreateMenuDialog />
    </>
  )
}
