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
        <TabsList className="grid grid-cols-3 sm:grid-cols-5">
          <TabsTrigger className='flex justify-center' value="catalog">{t('tab.catalog')}</TabsTrigger>
          <TabsTrigger className='flex justify-center' value="size">{t('tab.size')}</TabsTrigger>
          <TabsTrigger className='flex justify-center' value="product">{t('tab.product')}</TabsTrigger>
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
