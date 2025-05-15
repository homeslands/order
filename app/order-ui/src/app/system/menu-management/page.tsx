import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { SystemMenuManagementTabs } from '@/components/app/tabs'

export default function MenuManagementPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')

  return (
    <div className="grid grid-cols-1 w-full h-full">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.menuManagement.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.menuManagement.title')} />
      </Helmet>
      <span className="flex gap-1 items-center text-lg">
        <SquareMenu />
        {t('menu.title')}
      </span>
      <SystemMenuManagementTabs />
    </div>
  )
}
