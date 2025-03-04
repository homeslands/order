import { Helmet } from 'react-helmet'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/ui'
import { useBranch } from '@/hooks'
import { useBranchesColumns } from './DataTable/columns'
import { BranchActionOptions } from './DataTable/actions'


export default function BranchManagementPage() {
  const { t } = useTranslation(['branch'])
  const { t: tHelmet } = useTranslation('helmet')
  const { data, isLoading } = useBranch()

  return (
    <div className="grid w-full h-full grid-cols-1">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.branch.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.branch.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('branch.manageBranch')}
      </span>
      <DataTable
        columns={useBranchesColumns()}
        data={data?.result || []}
        isLoading={isLoading}
        pages={1}
        onPageChange={() => { }}
        onPageSizeChange={() => { }}
        actionOptions={BranchActionOptions}
      // filterOptions={IsTemplateFilter}
      />
    </div>
  )
}
