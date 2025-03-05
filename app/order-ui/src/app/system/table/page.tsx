import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useTables } from '@/hooks'
import { useUserStore } from '@/stores'
import { useTableColumns } from './DataTable/columns'
import { DataTable } from '@/components/ui'
import { TableAction } from './DataTable/actions'

export default function TablePage() {
  const { t } = useTranslation(['table'])
  const { t: tHelmet } = useTranslation('helmet')
  const { getUserInfo } = useUserStore()
  const { data: tables, isLoading } = useTables(getUserInfo()?.branch?.slug)

  return (
    <div className="flex flex-col flex-1 w-full">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.table.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.table.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('table.tableTitle')}
      </span>
      <div className="grid h-full grid-cols-1 gap-2 mt-4">
        <DataTable
          columns={useTableColumns()}
          data={tables?.result || []}
          isLoading={isLoading}
          pages={1}
          hiddenInput={false}
          actionOptions={TableAction}
          onPageChange={() => { }}
          onPageSizeChange={() => { }}
        />
      </div>
    </div>
    // <div className="pb-4">
    //   <div className="flex items-center justify-end gap-2 py-4">
    //     <CreateTableDialog />
    //   </div>
    //   <div className="border rounded-md">
    //     <div className="flex gap-4 p-4">
    //       <div className="gap-2 flex-center">
    //         <div className="w-4 h-4 border rounded-sm bg-muted-foreground/10" />
    //         <span className="text-sm">{t('table.available')}</span>
    //       </div>
    //       <div className="gap-2 flex-center">
    //         <div className="w-4 h-4 rounded-sm bg-primary" />
    //         <span className="text-sm">{t('table.reserved')}</span>
    //       </div>
    //     </div>
    //     <div className="flex flex-row flex-wrap w-full h-full gap-4 p-4">
    //       {tables?.result.map((table) => (
    //         <TableItem key={table.slug} table={table} />
    //       ))}
    //     </div>
    //   </div>
    // </div>
  )
}
