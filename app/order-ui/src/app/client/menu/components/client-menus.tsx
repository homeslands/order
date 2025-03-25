import { useTranslation } from 'react-i18next'

import { SkeletonMenuList } from '@/components/app/skeleton'
import { ISpecificMenu } from '@/types'
import { ClientMenuItem } from './client-menu-item'

interface IClientMenuProps {
  menu: ISpecificMenu | undefined
  isLoading: boolean
}

export function ClientMenus({ menu, isLoading }: IClientMenuProps) {
  const { t } = useTranslation('menu')

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


  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-3 lg:grid-cols-3`}>
        {[...Array(8)].map((_, index) => (
          <SkeletonMenuList key={index} />
        ))}
      </div>
    )
  }

  if (!menuItems || menuItems.length === 0) {
    return <p className="text-center">{t('menu.noData')}</p>
  }

  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-3`}>
      {menuItems.map((item) => (
        <ClientMenuItem item={item} key={item.slug} />
      ))}
    </div>
  )
}
