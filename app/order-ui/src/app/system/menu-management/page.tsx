import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useAllMenus, usePagination } from '@/hooks'
import { useMenusColumns } from './DataTable/columns'
import { MenusActionOptions } from './DataTable/actions'
import { useUserStore } from '@/stores'
import { IsTemplateFilter } from './DataTable/filters'

export default function MenuManagementPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const { data, isLoading } = useAllMenus({
    order: 'DESC',
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    branch: userInfo?.branch.slug,
  })

  return (
    <div className="grid w-full h-full grid-cols-1">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.menuManagement.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.menuManagement.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('menu.title')}
      </span>
      <DataTable
        columns={useMenusColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result?.totalPages || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={MenusActionOptions}
        filterOptions={IsTemplateFilter}
      />
    </div>
  )
}
