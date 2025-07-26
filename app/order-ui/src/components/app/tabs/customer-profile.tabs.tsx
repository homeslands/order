import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CustomerInfoTabsContent, CustomerCoinTabsContent } from '@/components/app/tabscontent'
import CustomerOrderTabs from './customer-order.tabs'

export function CustomerProfileTabs() {
  const { t } = useTranslation(['profile'])
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'info')

  useEffect(() => {
    setTab(searchParams.get('tab') || 'info')
  }, [searchParams, location])

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    setSearchParams({ tab: newTab }) // Cập nhật URL khi thay đổi tab
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 gap-3 mb-6 border-b sm:grid-cols-6 lg:mb-0 h-full">
        <TabsTrigger value="info" className="flex justify-center">
          {t('profile.generalInfo')}
        </TabsTrigger>
        {/* <TabsTrigger value="notification" className="flex justify-center">
          {t('profile.notification')}
        </TabsTrigger> */}
        <TabsTrigger value="history" className="flex justify-center">
          {t('profile.history')}
        </TabsTrigger>
        <TabsTrigger
          value="coin"
          className="flex-1 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
        >
          {t('profile.coin')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="w-full p-0 dark:text-gray-200">
        <CustomerInfoTabsContent />
      </TabsContent>
      {/* <TabsContent value="notification" className="w-full p-0">
        <CustomerNotificationTabsContent />
      </TabsContent> */}
      <TabsContent value="history" className="w-full p-0">
        <CustomerOrderTabs />
      </TabsContent>
      <TabsContent value="coin" className="w-full p-0 dark:text-gray-200">
        <CustomerCoinTabsContent />
      </TabsContent>
    </Tabs>
  )
}
