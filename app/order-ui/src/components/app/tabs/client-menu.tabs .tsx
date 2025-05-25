import { useTranslation } from 'react-i18next'

import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ClientMenuTabscontent } from '../tabscontent/client-menu.tabscontent'
// import { ClientUpdateOrderTableSelect } from '@/app/system/menu'

interface ClientMenusProps {
  onSuccess: () => void
}

export function ClientMenuTabs({ onSuccess }: ClientMenusProps) {
  const { t } = useTranslation(['menu'])
  return (
    <Tabs defaultValue="menu">
      <TabsList className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-4 lg:mb-2">
        <TabsTrigger value="menu" className="flex justify-center">
          {t('menu.menu')}
        </TabsTrigger>
        {/* Mở cmt này để hiển thị tab chọn bàn hình ảnh */}
        {/* <TabsTrigger value="table" className="flex justify-center">
          {t('menu.table')}
        </TabsTrigger> */}
      </TabsList>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <TabsContent value="menu" className="p-0">
          <ClientMenuTabscontent onSuccess={onSuccess} />
        </TabsContent>
      </ScrollArea>
      {/* <TabsContent value="table" className="p-0">
        <ClientUpdateOrderTableSelect onSuccess={onSuccess} order={order} defaultValue={defaultValue} />
      </TabsContent> */}
    </Tabs>
  )
}
