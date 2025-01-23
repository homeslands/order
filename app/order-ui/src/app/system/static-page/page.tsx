import { DataTable } from '@/components/ui'
import { useGetAllStaticPages } from '@/hooks'
import { useStaticPageColumns } from './DataTable/columns'
import { StaticPageActionOptions } from './DataTable/actions'

export default function StaticPage() {
  const { data: staticPages, isLoading } = useGetAllStaticPages()

  return (
    <div className="grid h-full grid-cols-1 gap-2">
      <DataTable
        columns={useStaticPageColumns()}
        data={staticPages?.result || []}
        isLoading={isLoading}
        pages={1}
        onInputChange={() => {}}
        actionOptions={StaticPageActionOptions}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  )
}
