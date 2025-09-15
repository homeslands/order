import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemHorizontalCatalogSelect, SystemTableSelectInUpdateOrder } from '../select'
import { SystemMenuInUpdateOrderTabscontent } from '../tabscontent'
import { FilterState, IOrder, OrderTypeEnum } from '@/types'
import { useCatalogStore, useOrderFlowStore, useUserStore } from '@/stores'
import moment from 'moment'
import { usePublicSpecificMenu, useSpecificMenu } from '@/hooks'

interface SystemMenuInUpdateOrderTabsProps {
  type: string
  order: IOrder
  onSuccess: () => void
}

export function SystemMenuInUpdateOrderTabs({ type, order, onSuccess }: SystemMenuInUpdateOrderTabsProps) {
  const { t } = useTranslation(['menu'])
  const [searchParams, setSearchParams] = useSearchParams()
  const { userInfo } = useUserStore()
  const { getOrderItems, initializeUpdating } = useOrderFlowStore()
  const orderItems = getOrderItems()
  const updatingOrder = orderItems?.updateDraft
  const { catalog } = useCatalogStore()

  const activeTab = searchParams.get('tab') || 'table'

  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: userInfo?.branch?.slug,
    catalog: catalog?.slug,
    productName: '',
  })
  const { data: specificMenu, isLoading } = useSpecificMenu(filters, !!userInfo?.slug)
  const { data: publicSpecificMenu } = usePublicSpecificMenu(filters, !!userInfo?.slug === false)

  const specificMenuResult = userInfo?.slug ? specificMenu?.result : publicSpecificMenu?.result;

  // Handle tab change by updating URL
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab }, { replace: true })
  }

  useEffect(() => {
    if (updatingOrder?.type === OrderTypeEnum.TAKE_OUT && searchParams.get('tab') !== 'menu') {
      handleTabChange('menu')
    } else if (updatingOrder?.type === OrderTypeEnum.AT_TABLE && orderItems?.originalOrder.type === OrderTypeEnum.AT_TABLE) {
      initializeUpdating(orderItems?.originalOrder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatingOrder?.type])

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
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="flex sticky top-0 z-20 flex-wrap gap-4 items-center py-2 bg-white shadow-sm dark:bg-background">
        <TabsList className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-6">
          {type === OrderTypeEnum.AT_TABLE && (
            <TabsTrigger value="table" className="flex justify-center">
              {t('menu.table')}
            </TabsTrigger>
          )}
          <TabsTrigger value="menu" className="flex justify-center">
            {t('menu.menu')}
          </TabsTrigger>
        </TabsList>
      </div>

      {type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0">
          <SystemTableSelectInUpdateOrder order={order} />
        </TabsContent>
      )}

      <TabsContent value="menu" className="p-0 pb-4 mt-0 w-full">
        <div className="sticky top-14 z-20 py-2 bg-white shadow-sm dark:bg-background">
          <SystemHorizontalCatalogSelect onChange={handleSelectCatalog} />
        </div>

        {/* Scrollable nội dung menu */}
        <ScrollArea className="w-full h-full">
          <SystemMenuInUpdateOrderTabscontent menu={specificMenuResult} isLoading={isLoading} onSuccess={onSuccess} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
