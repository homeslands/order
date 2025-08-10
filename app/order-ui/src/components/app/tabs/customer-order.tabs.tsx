import { useTranslation } from 'react-i18next'

import CustomerOrderTabsContent from '@/components/app/tabscontent/customer-order.tabscontent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CustomerGiftCardOrderTabsContent } from '@/components/app/tabscontent/customer-gift-card-order-tabs-content'

export default function CustomerOrderTabs() {
  const { t } = useTranslation('profile')
  return (
    <Tabs
      defaultValue="customer-order-history"
      className="flex w-full flex-col gap-4"
    >
      <TabsList
        className={`sticky top-5 z-10 flex items-center gap-2 bg-white dark:bg-transparent`}
      >
        <TabsTrigger
          value="customer-order-history"
          className="flex w-1/3 justify-center"
        >
          {t('profile.productOrders')}
        </TabsTrigger>
        <TabsTrigger
          value="customer-card-order-history"
          className="flex w-1/3 justify-center"
        >
          {t('profile.giftCards')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="customer-order-history">
        <CustomerOrderTabsContent />
      </TabsContent>
      <TabsContent value="customer-card-order-history">
        <CustomerGiftCardOrderTabsContent />
      </TabsContent>
    </Tabs>
  )
}
