import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CatalogTab, SizeTab, ProductTab } from '.'

export default function ProductManagementPage() {
  const { t } = useTranslation(['product'])
  const { t: tHelmet } = useTranslation('helmet')
  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.product.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.product.title')} />
      </Helmet>
      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid grid-cols-3 w-96">
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
    </div>
  )
}
