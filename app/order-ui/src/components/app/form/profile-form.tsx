import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserProfileCard } from '@/components/app/card'
import { OrderTabs } from '@/app/client/order-history'

export default function ProfileForm() {
  const { t } = useTranslation(['profile'])
  return (
    <div>
      <Tabs defaultValue="general-info" className="w-full">
        <TabsList className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <TabsTrigger value="general-info">
            {t('profile.generalInfo')}
          </TabsTrigger>
          <TabsTrigger value="myOrders">
            {t('profile.myOrders')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general-info" className="w-full p-0">
          <UserProfileCard />
        </TabsContent>
        <TabsContent value="myOrders">
          <OrderTabs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
