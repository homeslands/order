import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CustomerInfoTabsContent, CustomerNotificationTabsContent } from '@/components/app/tabscontent'
import CustomerOrderTabs from './customer-order.tabs'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function CustomerProfileTabs() {
  const { t } = useTranslation(['profile'])
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'info')

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    })
  }, [setSearchParams, tab])

  return (
    <Tabs defaultValue={tab} className="w-full">
      <TabsList className="grid grid-cols-3 gap-3 mb-6 border-b sm:grid-cols-6 lg:mb-0">
        <TabsTrigger
          value="info"
          className="flex justify-center"
          onClick={() => setTab('info')}
        >
          {t('profile.generalInfo')}
        </TabsTrigger>
        <TabsTrigger
          value="notification"
          className="flex justify-center"
          onClick={() => setTab('notification')}
        >
          {t('profile.notification')}
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex justify-center"
          onClick={() => setTab('history')}
        >
          {t('profile.history')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="w-full p-0">
        <CustomerInfoTabsContent />
      </TabsContent>
      <TabsContent value="notification" className="w-full p-0">
        <CustomerNotificationTabsContent />
      </TabsContent>
      <TabsContent value="history" className="w-full p-0">
        <CustomerOrderTabs />
      </TabsContent>
    </Tabs>
  )
}
