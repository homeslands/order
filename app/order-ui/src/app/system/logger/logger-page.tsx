import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useLoggerColumns } from './DataTable/columns'
import { useLogger, usePagination } from '@/hooks'
import { LoggerLevelFilter } from './DataTable/filters'

export default function LoggerPage() {
  const { t } = useTranslation(['log'])
  const { t: tHelmet } = useTranslation('helmet')
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const { data: loggers, isLoading } = useLogger({
    order: 'DESC',
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  })

  return (
    <div className="flex flex-col flex-1 w-full">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.log.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.log.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('log.title')}
      </span>
      <div className="grid h-full grid-cols-1 gap-2">
        <DataTable
          columns={useLoggerColumns()}
          data={loggers?.result?.items || []}
          isLoading={isLoading}
          pages={loggers?.result?.totalPages || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterOptions={LoggerLevelFilter}
        />
      </div>
    </div>
  )
}
