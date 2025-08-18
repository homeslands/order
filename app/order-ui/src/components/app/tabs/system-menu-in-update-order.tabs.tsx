import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemHorizontalCatalogSelect, SystemTableSelectInUpdateOrder } from '../select'
import { SystemMenuInUpdateOrderTabscontent } from '../tabscontent'
import { FilterState, IOrder, OrderTypeEnum } from '@/types'
import { useCatalogStore, useUserStore } from '@/stores'
import moment from 'moment'
import { useSpecificMenu } from '@/hooks'

interface SystemMenuInUpdateOrderTabsProps {
  type: string
  order: IOrder
  onSuccess: () => void
}

export function SystemMenuInUpdateOrderTabs({ type, order, onSuccess }: SystemMenuInUpdateOrderTabsProps) {
  const { t } = useTranslation(['menu'])
  const [activeTab, setActiveTab] = useState('menu')
  const { userInfo } = useUserStore()
  const { catalog } = useCatalogStore()

  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: userInfo?.branch?.slug,
    catalog: catalog?.slug,
    productName: '',
  })
  const { data: specificMenu, isLoading } = useSpecificMenu(filters)
  const specificMenuResult = specificMenu?.result;

  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      branch: userInfo?.branch?.slug,
      catalog: catalog?.slug,
      productName: '',
    }))
  }, [userInfo?.branch?.slug, catalog?.slug])

  const handleSelectCatalog = (catalog: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      catalog: catalog,
    }))
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex sticky top-0 z-20 flex-wrap gap-4 items-center py-2 bg-white dark:bg-background shadow-sm">
        <TabsList className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-6">
          <TabsTrigger value="menu" className="flex justify-center">
            {t('menu.menu')}
          </TabsTrigger>
          {type === OrderTypeEnum.AT_TABLE && (
            <TabsTrigger value="table" className="flex justify-center">
              {t('menu.table')}
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      <TabsContent value="menu" className="p-0 pb-4 mt-0 w-full">
        <div className="sticky top-14 z-20 py-2 bg-white dark:bg-background shadow-sm">
          <SystemHorizontalCatalogSelect onChange={handleSelectCatalog} />
        </div>

        {/* Scrollable nội dung menu */}
        <ScrollArea className="w-full h-full">
          <SystemMenuInUpdateOrderTabscontent menu={specificMenuResult} isLoading={isLoading} onSuccess={onSuccess} />
        </ScrollArea>
      </TabsContent>
      {type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0">
          <SystemTableSelectInUpdateOrder order={order} />
        </TabsContent>
      )}
    </Tabs>
  )
}
