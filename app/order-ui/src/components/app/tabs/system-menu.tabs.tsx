import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemHorizontalCatalogSelect, SystemTableSelect } from '../select'
import { SystemMenuTabscontent } from '../tabscontent'
import { useCatalogStore, useOrderFlowStore, useUserStore } from '@/stores'
import { FilterState, OrderTypeEnum } from '@/types'
import moment from 'moment'
import { useSpecificMenu } from '@/hooks'

export function SystemMenuTabs() {
  const { t } = useTranslation(['menu'])
  const [searchParams, setSearchParams] = useSearchParams()
  const { userInfo } = useUserStore()
  const { getCartItems, initializeOrdering } = useOrderFlowStore()
  const cartItems = getCartItems()
  const { catalog } = useCatalogStore()

  const activeTab = searchParams.get('tab') || 'table'

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const preCartItems = useRef<OrderTypeEnum | null | undefined>(null)
  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: userInfo?.branch?.slug,
    catalog: catalog?.slug,
    productName: '',
  })
  const { data: specificMenu, isLoading } = useSpecificMenu(filters)
  const specificMenuResult = specificMenu?.result;

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
      if (!cartItems?.type) {
        initializeOrdering()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Handle tab change by updating URL
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab }, { replace: true })
  }

  useEffect(() => {
    if (cartItems?.type === OrderTypeEnum.TAKE_OUT) {
      handleTabChange('menu')
    } else if (cartItems?.type === OrderTypeEnum.AT_TABLE && !isFirstLoad && preCartItems.current) {
      handleTabChange('table')
    }
    preCartItems.current = cartItems?.type
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems?.type])

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      {/* TabsList luôn sticky */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-4 py-2 bg-white dark:bg-background shadow-sm">
        <TabsList className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-6">
          {cartItems?.type === OrderTypeEnum.AT_TABLE && (
            <TabsTrigger value="table" className="flex justify-center">
              {t('menu.table')}
            </TabsTrigger>
          )}
          <TabsTrigger value="menu" className="flex justify-center">
            {t('menu.menu')}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content: Table */}
      {cartItems?.type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0 w-full sm:w-[90%] xl:w-full">
          <SystemTableSelect />
        </TabsContent>
      )}

      {/* Tab Content: Menu */}
      <TabsContent value="menu" className="w-full p-0 pb-4 mt-0">
        {/* Sticky CatalogSelect chỉ trong tab này */}
        <div className="sticky z-20 w-full py-2 overflow-x-auto bg-white dark:bg-background top-14">
          <SystemHorizontalCatalogSelect onChange={handleSelectCatalog} />
        </div>

        {/* Scrollable nội dung menu */}
        <ScrollArea className="w-full h-full">
          <SystemMenuTabscontent menu={specificMenuResult} isLoading={isLoading} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
