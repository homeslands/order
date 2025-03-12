import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ClientMenuTabscontent } from '../tabscontent/client-menu.tabscontent'
import { IOrder } from '@/types'
import { ClientUpdateOrderTableSelect } from '@/app/system/menu'

interface ClientMenusProps {
  order?: IOrder
  defaultValue?: string
  onSuccess: () => void
}

export function ClientMenuTabs({ order, defaultValue, onSuccess }: ClientMenusProps) {
  const { t } = useTranslation(['menu'])
  return (
    <Tabs defaultValue="menu">
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-4 lg:mb-0">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {/* Mở cmt này để hiển thị tab chọn bàn hình ảnh */}
        {/* <TabsTrigger value="table" className="flex justify-center">
          {t('menu.table')}
        </TabsTrigger> */}
      </TabsList>
      <TabsContent value="menu" className="w-full p-0 mt-6">
        <ClientMenuTabscontent onSuccess={onSuccess} />
      </TabsContent>
      <TabsContent value="table" className="p-0">
        <ClientUpdateOrderTableSelect onSuccess={onSuccess} order={order} defaultValue={defaultValue} />
      </TabsContent>
    </Tabs>
  )
}
