import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemTableSelectInUpdateOrder } from '../select'
import { SystemMenuInUpdateOrderTabscontent } from '../tabscontent'
import { IOrder, OrderTypeEnum } from '@/types'

interface SystemMenuInUpdateOrderTabsProps {
  type: string
  order: IOrder
  // onSuccess: () => void
}

export function SystemMenuInUpdateOrderTabs({ type, order }: SystemMenuInUpdateOrderTabsProps) {
  const { t } = useTranslation(['menu'])
  const [activeTab, setActiveTab] = useState('menu')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-3 lg:mb-2">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {type === OrderTypeEnum.AT_TABLE && (
          <TabsTrigger value="table" className="flex justify-center">
            {t('menu.table')}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="menu" className="w-full p-0">
        <SystemMenuInUpdateOrderTabscontent />
      </TabsContent>
      {type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0">
          <SystemTableSelectInUpdateOrder order={order} />
        </TabsContent>
      )}
    </Tabs>
  )
}
