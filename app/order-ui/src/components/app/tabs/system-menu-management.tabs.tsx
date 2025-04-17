import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemMenuManagementTabsContent } from '@/components/app/tabscontent'

export function SystemMenuManagementTabs() {
  const { t } = useTranslation(['menu'])
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'isTemplate')

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    })
  }, [setSearchParams, tab])

  return (
    <Tabs defaultValue={tab} className="w-full">
      <TabsList className="flex gap-3 justify-start mb-6 border-b sm:grid-cols-6 lg:mb-0">
        <TabsTrigger
          value="isTemplate"
          className="flex justify-center min-w-[150px]"
          onClick={() => setTab('isTemplate')}
        >
          {t('menu.isTemplate')}
        </TabsTrigger>
        <TabsTrigger
          value="notTemplate"
          className="flex justify-center min-w-[160px] w-fit"
          onClick={() => setTab('notTemplate')}
        >
          {t('menu.noTemplate')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="isTemplate" className="p-0 w-full">
        <SystemMenuManagementTabsContent />
      </TabsContent>
      <TabsContent value="notTemplate" className="p-0 w-full">
        <SystemMenuManagementTabsContent />
      </TabsContent>
    </Tabs>
  )
}
