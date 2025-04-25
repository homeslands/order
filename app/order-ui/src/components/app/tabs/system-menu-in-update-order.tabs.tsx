import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemTableSelectInUpdateOrder } from '../select'
import { SystemMenuInUpdateOrderTabscontent } from '../tabscontent'
import { IOrder, OrderTypeEnum } from '@/types'

interface SystemMenuInUpdateOrderTabsProps {
  type: string
  order: IOrder
  onSuccess: () => void
}

export function SystemMenuInUpdateOrderTabs({ type, order, onSuccess }: SystemMenuInUpdateOrderTabsProps) {
  const { t } = useTranslation(['menu'])

  const [activeTab, setActiveTab] = useState('menu')

  // check if order type is at table
  useEffect(() => {
    if (order && order?.type === OrderTypeEnum.AT_TABLE) {
      setActiveTab('table')
    }
  }, [order])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-6 lg:mb-0">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {type === OrderTypeEnum.AT_TABLE && (
          <TabsTrigger value="table" className="flex justify-center">
            {t('menu.table')}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="menu" className="p-0 w-full">
        <SystemMenuInUpdateOrderTabscontent onSuccess={onSuccess} />
      </TabsContent>
      {type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0">
          <SystemTableSelectInUpdateOrder order={order} onSuccess={onSuccess} />
        </TabsContent>
      )}
    </Tabs>
  )
}
