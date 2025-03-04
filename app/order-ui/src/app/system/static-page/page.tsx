import { DataTable } from '@/components/ui'
import { useGetAllStaticPages } from '@/hooks'
import { useStaticPageColumns } from './DataTable/columns'
import { StaticPageActionOptions } from './DataTable/actions'
import { Helmet } from 'react-helmet'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function StaticPage() {
  const { t } = useTranslation(['staticPage'])
  const { t: tHelmet } = useTranslation('helmet')
  const { data: staticPages, isLoading } = useGetAllStaticPages()

  return (
    <div className="grid h-full grid-cols-1 gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.staticPage.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.staticPage.title')} />
      </Helmet>
      <span className="flex items-center gap-1 text-lg">
        <SquareMenu />
        {t('staticPage.staticPageTitle')}
      </span>
      <DataTable
        columns={useStaticPageColumns()}
        data={staticPages?.result || []}
        isLoading={isLoading}
        pages={1}
        onInputChange={() => { }}
        actionOptions={StaticPageActionOptions}
        onPageChange={() => { }}
        onPageSizeChange={() => { }}
      />
    </div>
  )
}
