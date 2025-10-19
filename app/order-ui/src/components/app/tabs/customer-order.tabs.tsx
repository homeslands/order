import { useTranslation } from 'react-i18next'

import CustomerOrderTabsContent from '@/components/app/tabscontent/customer-order.tabscontent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CustomerGiftCardOrderTabsContent } from '@/components/app/tabscontent/customer-gift-card-order-tabs-content'

export default function CustomerOrderTabs() {
  const { t } = useTranslation('profile')
  return (
    <Tabs
      defaultValue="customer-order-history"
      className="flex flex-col gap-4 w-full"
    >
      <TabsList
        className={`grid sticky top-5 z-10 grid-cols-2 gap-2 items-center bg-transparent sm:grid-cols-5 dark:bg-transparent`}
      >
        <TabsTrigger
          value="customer-order-history"
          className="flex justify-center"
        >
          {t('profile.productOrders')}
        </TabsTrigger>
        <TabsTrigger
          value="customer-card-order-history"
          className="flex justify-center"
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
