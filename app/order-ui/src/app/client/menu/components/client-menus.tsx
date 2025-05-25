import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { ISpecificMenu } from '@/types'
import { ClientMenuItem } from './client-menu-item'
import { useCatalogs } from '@/hooks'

interface IClientMenuProps {
  menu: ISpecificMenu | undefined
  isLoading: boolean
}

export function ClientMenus({ menu, isLoading }: IClientMenuProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { data: catalogs, isLoading: isLoadingCatalog } = useCatalogs()

  const menuItems = menu?.menuItems?.sort((a, b) => {
    // Đưa các mục không bị khóa lên trước
    if (a.isLocked !== b.isLocked) {
      return Number(a.isLocked) - Number(b.isLocked);
    }

    // Coi mục với currentStock = null là "còn hàng" khi isLimit = false
    const aInStock = (a.currentStock !== 0 && a.currentStock !== null) || !a.product.isLimit;
    const bInStock = (b.currentStock !== 0 && b.currentStock !== null) || !b.product.isLimit;

    // Đưa các mục còn hàng lên trước
    if (aInStock !== bInStock) {
      return Number(bInStock) - Number(aInStock); // Còn hàng trước hết hàng
    }

    return 0;
  });


  if (isLoading || isLoadingCatalog) {
    return (
      <div className={`grid grid-cols-1 gap-3 lg:grid-cols-3`}>
        {[...Array(8)].map((_, index) => (
          <SkeletonMenuList key={index} />
        ))}
      </div>
    )
  }

  if (!menuItems || menuItems.length === 0) {
    return <p className="text-center">{t('menu.noData')}</p>
  }
  const groupedItems = catalogs?.result?.map(catalog => ({
    catalog,
    items: menuItems.filter(item => item.product.catalog.slug === catalog.slug),
  })) || [];
  groupedItems.sort((a, b) => b.items.length - a.items.length)
  return (
    <>
      {groupedItems?.length > 0 ? groupedItems.map((group, index) => (
        group.items.length > 0 &&
        <div className='mb-12 w-full' key={index}>
          <div className='uppercase primary-highlight'>{group.catalog.name}</div>
          <div className={`grid grid-cols-1 gap-6 mt-5 lg:grid-cols-4`}>
            {group.items.map((item) => (
              <ClientMenuItem item={item} key={item.slug} />
            ))}
          </div>
        </div>
      )) : <div>
        <div className='mb-12 w-full'>
          <div className='uppercase primary-highlight'>{tCommon('common.noData')}</div>
        </div>
      </div>}
    </>)
}
