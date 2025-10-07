import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ClientMenuTabscontent } from '../tabscontent/client-menu.tabscontent'
import MapAddressSelectorInUpdateOrder from '@/app/client/update-order/components/map-address-selector-in-update-order'
import { useOrderFlowStore } from '@/stores'
import { OrderTypeEnum } from '@/types'

interface ClientMenuTabsProps {
  onSuccess?: () => void
}

export function ClientMenuTabs({ onSuccess }: ClientMenuTabsProps) {
  const { t } = useTranslation(['menu'])
  const { updatingData } = useOrderFlowStore()
  const [activeTab, setActiveTab] = useState('menu')

  // Check if order type is DELIVERY to show address tab
  const isDelivery = updatingData?.updateDraft?.type === OrderTypeEnum.DELIVERY

  // Auto switch to address tab when order type changes to DELIVERY
  useEffect(() => {
    if (isDelivery) {
      setActiveTab('address')
    } else {
      setActiveTab('menu')
    }
  }, [isDelivery])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className={`grid gap-3 mb-10 lg:mb-2 ${isDelivery ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {isDelivery && (
          <TabsTrigger value="address" className="flex justify-center">
            {t('order.address')}
          </TabsTrigger>
        )}
        {/* <TabsTrigger value="table" className="flex justify-center">
          {t('menu.table')}
        </TabsTrigger> */}
      </TabsList>
      <TabsContent value="menu" className="p-0">
        <ClientMenuTabscontent onSuccess={onSuccess} />
      </TabsContent>
      {isDelivery && (
        <TabsContent value="address" className="p-0 h-full">
          <div className="flex flex-col gap-3">
            <MapAddressSelectorInUpdateOrder onSubmit={onSuccess} />
          </div>
        </TabsContent>
      )}
      {/* <TabsContent value="table" className="p-0">
        <ClientUpdateOrderTableSelect onSuccess={onSuccess} order={order} defaultValue={defaultValue} />
      </TabsContent> */}
    </Tabs>
  )
}
