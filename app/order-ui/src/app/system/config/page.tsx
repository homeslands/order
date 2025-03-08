import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { ScrollArea } from '@/components/ui'
import { SystemConfigForm } from '@/components/app/form'

export default function MenuManagementPage() {
  const { t } = useTranslation(['config'])
  const { t: tHelmet } = useTranslation('helmet')

  return (
    <div className="flex flex-row h-full gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.config.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.config.title')} />
      </Helmet>
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div className={`transition-all duration-300 ease-in-out`}>
          <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4">
            <span className="flex items-center justify-start w-full gap-1 text-lg">
              <SquareMenu />
              {t('config.title')}
            </span>
            <SystemConfigForm />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
