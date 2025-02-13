import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemTableSelect } from '../select'
import { SystemMenuTabscontent } from '../tabscontent'

export function SystemMenuTabs() {
  const { t } = useTranslation(['menu'])
  return (
    <Tabs defaultValue="menu">
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-6 lg:mb-0">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        <TabsTrigger value="table" className="flex justify-center">
          {t('menu.table')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="menu" className="w-full p-0">
        <SystemMenuTabscontent />
      </TabsContent>
      <TabsContent value="table" className="p-0">
        <SystemTableSelect />
      </TabsContent>
    </Tabs>
  )
}
