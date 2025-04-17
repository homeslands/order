import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'
import { SquareMenu } from 'lucide-react'
import moment from 'moment'

import { useSpecificMenu } from '@/hooks'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { MenuItemCard } from './components'
import { AddMenuItemSheet } from '@/components/app/sheet'

export default function MenuDetailManagementPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { slug } = useParams()
  const { data: menuDetail, isLoading, refetch } = useSpecificMenu({
    slug: slug as string,
  })

  const menuDetailData = menuDetail?.result

  if (isLoading) {
    return <ProductDetailSkeleton />
  }
  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.menu.manageMenu')}
        </title>
        <meta name='description' content={tHelmet('helmet.menu.title')} />
      </Helmet>
      <div className="flex gap-1 items-center mb-4 w-full text-lg">
        <SquareMenu />
        {t('menu.title')}
        {' - '}
        {moment(menuDetailData?.date).format('DD/MM/YYYY')}
      </div>
      <div className="flex justify-end pr-2 mb-4">
        <AddMenuItemSheet branch={menuDetailData?.branch.slug} menuSlug={menuDetailData?.slug} />
      </div>
      <div className="flex flex-row gap-2">
        {/* List menu items */}
        <div
          className={
            `w-full transition-all duration-300 ease-in-out`}
        >

          {menuDetailData && menuDetailData?.menuItems.length > 0 ? menuDetailData?.menuItems.map((item) => (
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-4`}
            >
              <MenuItemCard onSuccess={refetch} menuItem={item} isTemplate={menuDetailData.isTemplate} />
            </div>
          )) : <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <p className="text-gray-500">
              {t('menu.noMenuItems')}
            </p>
          </div>}
        </div>
      </div>
    </div>
  )
}
