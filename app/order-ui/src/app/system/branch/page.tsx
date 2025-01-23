import { DataTable } from '@/components/ui'
import { useBranch } from '@/hooks'
import { useBranchesColumns } from './DataTable/columns'
import { BranchActionOptions } from './DataTable/actions'

export default function BranchManagementPage() {
  const { data, isLoading } = useBranch()

  return (
    <div className="grid h-full w-full grid-cols-1">
      <DataTable
        columns={useBranchesColumns()}
        data={data?.result || []}
        isLoading={isLoading}
        pages={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        actionOptions={BranchActionOptions}
        // filterOptions={IsTemplateFilter}
      />
    </div>
  )
}
