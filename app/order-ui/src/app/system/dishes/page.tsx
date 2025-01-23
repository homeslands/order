import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CatalogTab, SizeTab, ProductTab } from '.'

export default function ProductManagementPage() {
  const { t } = useTranslation(['product'])
  return (
    <Tabs defaultValue="product" className="w-full">
      <TabsList className="grid w-96 grid-cols-3">
        <TabsTrigger value="catalog">{t('tab.catalog')}</TabsTrigger>
        <TabsTrigger value="size">{t('tab.size')}</TabsTrigger>
        <TabsTrigger value="product">{t('tab.product')}</TabsTrigger>
      </TabsList>
      <TabsContent value="catalog" className="w-full">
        <CatalogTab />
      </TabsContent>
      <TabsContent value="size" className="w-full">
        <SizeTab />
      </TabsContent>
      <TabsContent value="product">
        <ProductTab />
      </TabsContent>
    </Tabs>
  )
}
