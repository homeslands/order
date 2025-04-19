import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { DataTable } from '@/components/ui'
import { useAllMenus, usePagination } from '@/hooks'
import { useBranchStore } from '@/stores'
import { useMenusColumns } from '@/app/system/menu-management/DataTable/columns'
import { MenusActionOptions } from '@/app/system/menu-management/DataTable/actions'
import { IMenu } from '@/types'
import { ROUTE } from '@/constants'

export function SystemMenuManagementTabsContent() {
  const navigate = useNavigate()
  const { branch } = useBranchStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'isTemplate'

  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()

  // Set default tab and branch slug in URL
  useEffect(() => {
    const updatedParams = new URLSearchParams(searchParams)
    if (!searchParams.get('tab')) {
      updatedParams.set('tab', 'isTemplate')
    }
    if (branch?.slug) {
      updatedParams.set('branch', branch.slug)
    }
    setSearchParams(updatedParams)
  }, [branch, setSearchParams, searchParams])

  const { data, isLoading } = useAllMenus({
    order: 'DESC',
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    branch: branch?.slug,
    isTemplate: tab === 'isTemplate',
  })

  const handleRowClick = (row: IMenu) => {
    navigate(`${ROUTE.STAFF_MENU_MANAGEMENT}/${row.slug}`)
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <DataTable
        columns={useMenusColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result?.totalPages || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={MenusActionOptions}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
