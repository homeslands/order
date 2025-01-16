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

  const menuItems = menu?.menuItems

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
