import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  CustomerInfoTabsContent,
  CustomerCoinTabsContent,
  CustomerGiftCardTabsContent,
  CustomerLoyaltyPointTabsContent,
} from '@/components/app/tabscontent'
import CustomerOrderTabs from './customer-order.tabs'

export function SystemCustomerInfoTabs() {
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
      <TabsList className="scrollbar-hide mb-6 flex h-full w-full !justify-start gap-3 overflow-x-auto lg:mb-0">
        <TabsTrigger
          value="info"
          className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3"
        >
          {t('customer.generalInfo')}
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
        >
          {t('customer.history')}
        </TabsTrigger>
        <TabsTrigger
          value="loyalty-point"
          className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
        >
          {t('customer.loyaltyPoints')}
        </TabsTrigger>
        <TabsTrigger
          value="coin"
          className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
        >
          {t('customer.coin')}
        </TabsTrigger>
        <TabsTrigger
          value="gift-card"
          className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
        >
          {t('customer.giftCard.defaultTitle')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="p-0 w-full dark:text-gray-200">
        <CustomerInfoTabsContent />
      </TabsContent>
      <TabsContent value="loyalty-point" className="p-0 w-full dark:text-gray-200">
        <CustomerLoyaltyPointTabsContent />
      </TabsContent>
      <TabsContent value="history" className="p-0 w-full">
        <CustomerOrderTabs />
      </TabsContent>
      <TabsContent value="coin" className="p-0 w-full dark:text-gray-200">
        <CustomerCoinTabsContent />
      </TabsContent>
      <TabsContent value="gift-card" className="p-0 w-full dark:text-gray-200">
        <CustomerGiftCardTabsContent />
      </TabsContent>
    </Tabs>
  )
}
