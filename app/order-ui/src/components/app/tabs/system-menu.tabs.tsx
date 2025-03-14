import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemTableSelect } from '../select'
import { SystemMenuTabscontent } from '../tabscontent'
import { useCartItemStore } from '@/stores'
import { OrderTypeEnum } from '@/types'

export function SystemMenuTabs() {
  const { t } = useTranslation(['menu'])
  const { getCartItems } = useCartItemStore()
  const cartItems = getCartItems()

  const [activeTab, setActiveTab] = useState('menu')

  useEffect(() => {
    if (cartItems?.type === OrderTypeEnum.TAKE_OUT) {
      setActiveTab('menu')
    }
  }, [cartItems?.type])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-6 lg:mb-0">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {cartItems?.type === OrderTypeEnum.AT_TABLE && (
          <TabsTrigger value="table" className="flex justify-center">
            {t('menu.table')}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="menu" className="w-full p-0">
        <SystemMenuTabscontent />
      </TabsContent>
      {cartItems?.type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0">
          <SystemTableSelect />
        </TabsContent>
      )}
    </Tabs>
  )
}
